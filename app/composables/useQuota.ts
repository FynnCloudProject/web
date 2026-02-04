export interface QuotaDTO {
    used: number
    limit: number
    tierName: string
}

export const useQuota = () => {
    const usage = useState<number>('quota-usage', () => 0)
    const limit = useState<number>('quota-limit', () => 0)
    const tier = useState<string>('quota-tier', () => '')
    const config = useRuntimeConfig()
    const isLoading = ref(false)

    const fetchQuota = async () => {
        const apiBase = useApiBase()
        isLoading.value = true
        try {
            const data = await useApi<QuotaDTO>(`${apiBase}/api/user/quotas`)
            usage.value = data.used
            limit.value = data.limit
            tier.value = data.tierName
        } catch (e) {
            console.error('Failed to fetch quota:', e)
            // If 404 (which might happen if no files?), maybe set usage to 0?
            // But let's look at the backend code: "currentStorageUsage ... sum ... else throw Abort(.notFound)"
            // So if no files, it throws 404. We should treat it as 0 usage.
            const status = (e as any).statusCode || (e as any).response?.status
            if (status === 404) {
                usage.value = 0
            }
        } finally {
            isLoading.value = false
        }
    }

    const percentage = computed(() => {
        if (limit.value === 0) return 0
        return Math.min(Math.round((usage.value / limit.value) * 100), 100)
    })



    const formattedUsage = computed(() => `${formatSize(usage.value)} / ${formatSize(limit.value)}`)

    return {
        usage,
        limit,
        tier,
        percentage,
        isLoading,
        formattedUsage,
        fetchQuota
    }
}
