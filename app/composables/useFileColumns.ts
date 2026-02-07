import type { ColumnDefinition, FileItem } from '~/types/file'

export function useFileColumns(isTrash: Ref<boolean>) {
  const hiddenColumnKeys = ref<Set<string>>(new Set())
  const showColumnMenu = ref(false)

  const availableColumns = computed<ColumnDefinition[]>(() => [
    { key: 'size', label: 'files.columns.size', type: 'size', sortable: true, class: 'w-32 hidden sm:table-cell' },
    { key: 'updatedAt', label: 'files.columns.lastChanged', type: 'date', sortable: true, class: 'w-48 hidden md:table-cell' },
    { key: 'createdAt', label: 'files.columns.created', type: 'date', sortable: true, class: 'w-48 hidden lg:table-cell' },
    ...(isTrash.value ? [{ key: 'deletedAt' as keyof FileItem, label: 'files.columns.deletedAt', type: 'date', sortable: true, class: 'w-48 hidden md:table-cell' } as ColumnDefinition] : [])
  ])

  const activeColumns = computed(() => {
    return availableColumns.value.filter(col => !hiddenColumnKeys.value.has(col.key))
  })

  const toggleColumn = (col: ColumnDefinition) => {
    if (hiddenColumnKeys.value.has(col.key)) {
      hiddenColumnKeys.value.delete(col.key)
    } else {
      hiddenColumnKeys.value.add(col.key)
    }
  }

  return {
    hiddenColumnKeys,
    showColumnMenu,
    availableColumns,
    activeColumns,
    toggleColumn
  }
}
