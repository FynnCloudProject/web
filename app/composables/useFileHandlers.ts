
import type { FileItem } from '~/types/file'

export const useFileHandlers = () => {
    const router = useRouter()
    const route = useRoute()
    const { play: playAudio } = useAudioPlayer()
    const { open: openPreview } = usePreview()

    const getNavigatePath = (item: FileItem) => {
        if (item.type !== 'folder') return undefined
        const currentPathQuery = (route.query.path as string) || ''
        const newPath = currentPathQuery.endsWith('/') ? currentPathQuery + item.name : currentPathQuery + '/' + item.name

        return {
            path: `/files/${item.id}`,
            query: {
                ...route.query,
                path: newPath
            }
        }
    }

    const handlers: Record<string, (item: FileItem, contextFiles?: FileItem[]) => void> = {
        'folder': (item) => {
            const path = getNavigatePath(item)
            if (path) router.push(path)
        },
        'audio': (item, contextFiles) => playAudio(item, contextFiles || []),
        'video': (item, contextFiles) => openPreview(item, contextFiles || []),
        'pdf': (item, contextFiles) => openPreview(item, contextFiles || []),
        'image': (item, contextFiles) => openPreview(item, contextFiles || []),
    }

    const openFile = (item: FileItem, contextFiles?: FileItem[]) => {
        const handler = handlers[item.type]
        if (handler) {
            handler(item, contextFiles)
        } else {
            console.warn(`No handler for file type: ${item.type}`)
        }
    }

    return {
        openFile

    }
}
