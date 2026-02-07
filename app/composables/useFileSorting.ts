import type { FileItem } from '~/types/file'

type SortField = keyof FileItem

export function useFileSorting(items: Ref<FileItem[]>) {
  const sortField = ref<SortField>('name')
  const sortDirection = ref<'asc' | 'desc'>('asc')

  const sortedItems = computed(() => {
    const itemsCopy = [...items.value]
    return itemsCopy.sort((a, b) => {
      let aVal: any = a[sortField.value]
      let bVal: any = b[sortField.value]

      // Special handling for size to sort by bytes
      if (sortField.value === 'size') {
        aVal = a.sizeBytes || 0
        bVal = b.sizeBytes || 0
      }

      // Generic Date handling
      if (aVal instanceof Date) aVal = aVal.getTime()
      if (bVal instanceof Date) bVal = bVal.getTime()

      // Generic String handling
      if (typeof aVal === 'string') aVal = aVal.toLowerCase()
      if (typeof bVal === 'string') bVal = bVal.toLowerCase()

      const modifier = sortDirection.value === 'asc' ? 1 : -1
      return aVal < bVal ? -1 * modifier : aVal > bVal ? 1 * modifier : 0
    })
  })

  const toggleSort = (field: SortField) => {
    sortDirection.value = (sortField.value === field && sortDirection.value === 'asc') ? 'desc' : 'asc'
    sortField.value = field
  }

  return {
    sortField,
    sortDirection,
    sortedItems,
    toggleSort
  }
}
