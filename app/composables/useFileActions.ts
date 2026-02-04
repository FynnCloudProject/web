import type { FileItem } from '~/types/file'

export const useFileActions = (
    refresh: () => Promise<any>,
    clearSelection?: () => void
) => {
    const { t } = useI18n()
    const { createFolder, deleteFiles, deleteFilesPermanently, renameFile, moveFile, restoreFile } = useFiles()

    const handleCreateFolder = async (name: string, parentID: string | null): Promise<boolean> => {
        if (!name) return false
        try {
            await createFolder(name, parentID)
            await refresh()
            return true
        } catch (e) {
            alert(t('files.alerts.createFolderFailed'))
            return false
        }
    }

    const handleDeleteFiles = async (items: FileItem[], isTrash: boolean = false): Promise<boolean> => {
        if (items.length === 0) return false
        try {
            const ids = items.map(i => i.id)
            if (isTrash) {
                await deleteFilesPermanently(ids)
            } else {
                await deleteFiles(ids)
            }
            if (clearSelection) clearSelection()
            await refresh()
            return true
        } catch (e) {
            alert(t('files.alerts.deleteFailed'))
            return false
        }
    }

    const handleRenameFile = async (item: FileItem, newName: string, extension: string): Promise<boolean> => {
        if (!item || !newName) return false
        try {
            const fullName = extension ? `${newName}.${extension}` : newName
            await renameFile(item.id, fullName)
            await refresh()
            return true
        } catch (e) {
            alert(t('files.alerts.renameFailed'))
            return false
        }
    }

    const handleRestoreFiles = async (items: FileItem[]): Promise<boolean> => {
        try {
            await Promise.all(items.map(t => restoreFile(t.id)))
            if (clearSelection) clearSelection()
            await refresh()
            return true
        } catch (e) {
            alert(t('files.alerts.restoreFailed'))
            return false
        }
    }

    const handleMoveFiles = async (sourceIds: string[], targetId: string | null): Promise<boolean> => {
        if (sourceIds.length === 0) return false
        try {
            await Promise.all(sourceIds.map(id => moveFile(id, targetId)))
            if (clearSelection) clearSelection()
            await refresh()
            return true
        } catch (e) {
            alert(t('files.alerts.moveFailed'))
            return false
        }
    }

    const getDeleteDescription = (items: FileItem[], isTrash: boolean) => {
        const count = items.length
        if (isTrash) {
            if (count === 1) return t('files.actions.deletePermanent.descriptionSingle', { name: items[0]?.name })
            return t('files.actions.deletePermanent.descriptionMultiple', { count })
        }
        if (count === 1) return t('files.actions.delete.descriptionSingle', { name: items[0]?.name })
        return t('files.actions.delete.descriptionMultiple', { count })
    }

    return {
        handleCreateFolder,
        handleDeleteFiles,
        handleRenameFile,
        handleRestoreFiles,
        handleMoveFiles,
        getDeleteDescription
    }
}
