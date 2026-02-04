export const useApiBase = () => {
    const config = useRuntimeConfig()
    
    // Allow override via config/env vars if present
    if (config.public.apiBase) {
        return config.public.apiBase
    }

    let host = ''
    let protocol = 'https'

    if (import.meta.server) {
        try {
            const url = useRequestURL()
            host = url.host
            protocol = url.protocol.replace(':', '')
        } catch (e) {
            console.warn('useApiBase: Failed to get request URL', e)
            return '' 
        }
    } else {
        host = window.location.host
        protocol = window.location.protocol.replace(':', '')
    }

    // Use the current domain (including subdomain)
    return `${protocol}://${host}`
}
