

import type { FileItem } from '~/types/file'


// Global State
const isVisible = ref(false)
const currentFile = ref<FileItem | null>(null)
const previewUrl = ref<string | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const contextFiles = ref<FileItem[]>([]) // Playlist/Gallery context

export const usePreview = () => {
    const config = useRuntimeConfig()

    // Helper to clear state
    const close = () => {
        isVisible.value = false
        if (previewUrl.value) {
            URL.revokeObjectURL(previewUrl.value)
            previewUrl.value = null
        }
        currentFile.value = null
        error.value = null
        isLoading.value = false
        // We might want to keep contextFiles for persistent navigation logic if needed,
        // but typically closing the preview clears the immediate session.
    }

    const open = async (file: FileItem, files: FileItem[] = []) => {
        close()
        
        currentFile.value = file
        // Filter context files to only match the current file type for navigation
        // (e.g., paging through images, but maybe skipping videos if mixed? 
        //  Actually, usually we only page through same-type items or all items if supported.
        //  The previous implementation filtered by type, so we preserve that behavior per type.)
        if (file.type === 'image') {
            contextFiles.value = files.filter(f => f.type === 'image')
        } else if (file.type === 'audio') {
             // Audio is handled by useAudioPlayer usually, but if opened here (unlikely)
             contextFiles.value = files.filter(f => f.type === 'audio')
        } else {
             // For PDF/Video/Others, we might not assume context navigation yet, 
             // but if we do, we filter by same type.
             contextFiles.value = files.filter(f => f.type === file.type)
        }

        isVisible.value = true
        
        if (file.type === 'video') {
            // For video, we just construct the URL
             const apiBase = useApiBase()
             previewUrl.value = `${apiBase}/api/files/${file.id}/download`
        } else {
            // Fetch Blob for Images and PDF
            isLoading.value = true
            try {
                const blob = await useApi<Blob>(`/api/files/${file.id}/download`, { responseType: 'blob' })

                // Mime type fallback
                const type = blob.type || (file.type === 'pdf' ? 'application/pdf' : 'image/jpeg') 
                
                const objectFile = new File([blob], file.name, { type })
                previewUrl.value = URL.createObjectURL(objectFile)
            } catch (e: any) {
                console.error("Failed to open file", e)
                error.value = e.message || "Failed to load file"
            } finally {
                isLoading.value = false
            }
        }
    }

    // Navigation
    const currentIndex = computed(() => {
        if (!currentFile.value) return -1
        return contextFiles.value.findIndex(f => f.id === currentFile.value?.id)
    })

    const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < contextFiles.value.length - 1)
    const hasPrevious = computed(() => currentIndex.value > 0)

    const next = () => {
        if (hasNext.value) {
            const nextFile = contextFiles.value[currentIndex.value + 1]
            if (nextFile) open(nextFile, contextFiles.value)
        }
    }

    const previous = () => {
        if (hasPrevious.value) {
            const prevFile = contextFiles.value[currentIndex.value - 1]
            if (prevFile) open(prevFile, contextFiles.value)
        }
    }

    const download = () => {
        if (!previewUrl.value || !currentFile.value) return

        const link = document.createElement('a')
        link.href = previewUrl.value
        link.download = currentFile.value.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return {
        isVisible,
        currentFile,
        previewUrl,
        isLoading,
        error,
        contextFiles,
        hasNext,
        hasPrevious,
        open,
        close,
        next,
        previous,
        download
    }
}
