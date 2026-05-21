import type { BreadcrumbItem } from '~/types/file'
import type { FileManager } from '~/composables/useFiles'

interface FolderRouteOptions {
  manager: FileManager
  rootBreadcrumb: BreadcrumbItem
  fetchFn: (parentID: string | null, breadcrumbs?: BreadcrumbItem[]) => Promise<any>
}

/**
 * Handles folder-based route watching for pages like files/[...path] and trash/[...path].
 * Extracts the folder ID from route params and builds breadcrumbs from query.path.
 */
export const useFolderRoute = (options: FolderRouteOptions) => {
  const route = useRoute()

  const folderID = computed(() => {
    if (Array.isArray(route.params.path)) {
      return route.params.path[route.params.path.length - 1] || null
    }
    return (route.params.path as string) || null
  })

  watch(folderID, async (newID, oldID) => {
    if (oldID !== undefined && newID === oldID) return

    const pathStr = route.query.path as string
    let initialBreadcrumbs: BreadcrumbItem[] | undefined

    if (pathStr) {
      const parts = pathStr.split('/').filter(Boolean)
      initialBreadcrumbs = [
        options.rootBreadcrumb,
        ...parts.map((name, index) => ({
          name,
          id: index === parts.length - 1 ? newID : undefined,
        })),
      ]
    }

    await options.fetchFn(newID, initialBreadcrumbs)
  }, { immediate: true })

  return { folderID }
}
