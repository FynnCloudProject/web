import type { FileItem } from "~/types/file"


// Global state to persist across components
const currentTrack = ref<FileItem | null>(null)
const isPlaying = ref(false)
const isVisible = ref(false) // If player is shown
const playerHeight = ref(0) // Height of the player in pixels
const playlist = ref<FileItem[]>([]) // Playlist context

export const useAudioPlayer = () => {
    const trackSrc = computed(() => {
        const apiBase = useApiBase()
        if (!currentTrack.value) return ''
        return `${apiBase}/api/files/${currentTrack.value.id}/download`
    })

    const play = (file: FileItem, contextFiles: FileItem[] = []) => {
        if (file.type !== 'audio') return

        // If we are already playing this track, just ensure visibility and playing
        if (currentTrack.value?.id === file.id) {
            isVisible.value = true
            isPlaying.value = true
            if (contextFiles.length > 0) {
                playlist.value = contextFiles.filter(f => f.type === 'audio')
            }
            return
        }

        currentTrack.value = file
        isVisible.value = true
        isPlaying.value = true
        
        if (contextFiles.length > 0) {
            playlist.value = contextFiles.filter(f => f.type === 'audio')
        } 
        // If no context provided and playlist is empty or file not in playlist, make single item playlist
        else if (playlist.value.length === 0 || !playlist.value.find(f => f.id === file.id)) {
            playlist.value = [file]
        }
    }

    const pause = () => {
        isPlaying.value = false
    }

    const resume = () => {
        isPlaying.value = true
    }

    const close = () => {
        isPlaying.value = false
        isVisible.value = false
        currentTrack.value = null
        playerHeight.value = 0
        playlist.value = []
    }

    const currentIndex = computed(() => {
        if (!currentTrack.value) return -1
        return playlist.value.findIndex(f => f.id === currentTrack.value?.id)
    })

    const hasNext = computed(() => currentIndex.value !== -1 && currentIndex.value < playlist.value.length - 1)
    const hasPrevious = computed(() => currentIndex.value > 0)

    const next = () => {
        if (hasNext.value) {
            const nextTrack = playlist.value[currentIndex.value + 1]
            if (nextTrack) play(nextTrack)
        }
    }

    const previous = () => {
        if (hasPrevious.value) {
            const prevTrack = playlist.value[currentIndex.value - 1]
            if (prevTrack) play(prevTrack)
        }
    }

    return {
        currentTrack,
        trackSrc,
        isPlaying,
        isVisible,
        play,
        pause,
        resume,
        close,
        playerHeight,
        hasNext,
        hasPrevious,
        next,
        previous
    }
}
