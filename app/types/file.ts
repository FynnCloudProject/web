export type FileType =
    | 'folder'
    | 'image'
    | 'video'
    | 'audio'
    | 'pdf'
    | 'doc'
    | 'sheet'
    | 'slide'
    | 'archive'
    | 'code'
    | 'file'

export interface FileItem {
    id: string
    name: string
    type: FileType
    size?: string
    sizeBytes?: number
    updatedAt: Date
    createdAt: Date
    deletedAt?: Date
    isFavorite?: boolean
    isShared?: boolean
    isRecent?: boolean
}
export interface BreadcrumbItem {
    id?: string | null
    name: string
    labelKey?: string
    icon?: string 
    color?: string
    path?: string
}

export interface ColumnDefinition {
    key: keyof FileItem
    label: string
    type: 'text' | 'date' | 'size'
    sortable?: boolean
    class?: string
}

export interface ApiFile {
    id: string
    filename: string
    contentType: string
    size: number
    isDirectory: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string
    isFavorite?: boolean
    isShared?: boolean
    isRecent?: boolean
}

export interface FileIndexDTO {
    files: ApiFile[]
    parentID: string | null
    breadcrumbs: BreadcrumbItem[]
}
