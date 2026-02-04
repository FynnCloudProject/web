export const useBackEndConfig = () => {
    const { setPrimaryColor } = useTheme()
    const appName = useState('app-name', () => 'FynnCloud')
    const maxFileSize = useState('max-file-size', () => 104857600) // Default 100MB
    const environment = useState('environment', () => 'development')
    const appVersion = useState('app-version', () => '1.0.0')

    interface InfoResponse {
        appName?: string
        version?: string
        maxFileSize?: number
        environment?: string
        primaryColor?: string
        [key: string]: any
    }

    const initAppConfig = async () => {
        try {
            const info = await useApi<InfoResponse>('/api/info')
            console.log('AppConfig: Received info:', info)

            if (info?.appName) {
                appName.value = info.appName
                useHead({
                    titleTemplate: (title) => title ? `${title} - ${info.appName}` : info.appName || null
                })
            }
            
            if (info?.version) appVersion.value = info.version
            if (info?.maxFileSize) maxFileSize.value = info.maxFileSize
            if (info?.environment) environment.value = info.environment

            if (info?.primaryColor) {
                setPrimaryColor(info.primaryColor)
            }
        } catch (e) {
            console.error('Failed to fetch app config:', e)
        }
    }

    return {
        appName,
        maxFileSize,
        environment,
        appVersion,
        initAppConfig
    }
}
