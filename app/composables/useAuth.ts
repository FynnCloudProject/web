export const useAuth = () => {
    const user = useState<any>('user', () => null)
    const apiBase = useApiBase()
    const route = useRoute()

    const generateRandomString = (length: number) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
        const values = crypto.getRandomValues(new Uint8Array(length))
        return Array.from(values).reduce((acc, x) => acc + possible[x % possible.length], "")
    }

    const generateCodeChallenge = async (verifier: string) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(verifier)
        const digest = await crypto.subtle.digest('SHA-256', data)
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    }

    const fetchUser = async () => {
        try {
            user.value = await useApi('/api/user/me')
        } catch (e: any) {
             // useApi handles 401 auto-logout/refresh.
             // We can log other errors if needed.
             // If refresh fails, user is redirected and user.value remains null (default).
        }
    }

    const login = async (credentials: { username: string; password: string }) => {
        const verifier = generateRandomString(64)
        const challenge = await generateCodeChallenge(verifier)
        sessionStorage.setItem('pkce_verifier', verifier)

        const authResponse: any = await $fetch(`${apiBase}/api/auth/login`, {
            method: 'POST',
            body: {
                ...credentials,
                codeChallenge: challenge,
                clientId: 'fynncloud-web',
            },
        })

        const userData: any = await $fetch(`${apiBase}/api/auth/exchange`, {
            method: 'POST',
            body: {
                code: authResponse.code,
                code_verifier: verifier,
                clientId: 'fynncloud-web',
            }
        })

        user.value = userData
        navigateTo(route.query.redirect?.toString() || '/')
    }


    const logout = async () => {
        try {
            await $fetch(`${apiBase}/api/auth/logout`, { method: 'POST' })
        } catch (e) {
            console.warn('Logout failed')
        }
        user.value = null
        navigateTo('/auth/login')
    }

    const register = async (credentials: any) => {
        await $fetch(`${apiBase}/api/auth/register`, {
            method: 'POST',
            body: credentials
        })
        await login({ username: credentials.username, password: credentials.password })
    }

    return { user, login, register, logout, fetchUser }
}