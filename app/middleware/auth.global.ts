export default defineNuxtRouteMiddleware(async (to, from) => {
    const { user, fetchUser } = useAuth()

    // Only fetch if we haven't checked yet or if we suspect we need to validate
    // Ideally, we might want a flag like 'isAuthChecked' to avoid redundant 401 calls
    // For now, if user is null, we try to fetch. 
    // But if we just failed fetching, we shouldn't fetch again immediately loop.
    // We can rely on Nuxt's hydration for user state.

    if (!user.value) {
        await fetchUser()
    }

    const publicRoutes = ['/auth/login', '/auth/register', '/auth/callback']
    const isPublicRoute = publicRoutes.some(route => to.path === route || to.path.startsWith(route))

    // If authenticated and trying to access a public route (like login), redirect to home
    if (user.value && isPublicRoute) {
        return navigateTo('/')
    }

    // If not authenticated and trying to access a protected route, redirect to login
    if (!user.value && !isPublicRoute) {
        if (import.meta.client) {
            return navigateTo('/auth/login?redirect=' + encodeURIComponent(to.fullPath))
        }
    }
})
