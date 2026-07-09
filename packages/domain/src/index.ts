export type BookStatus = 'OWNED' | 'READING' | 'FINISHED' | 'WISHLIST'

export interface Category {
  id: string
  name: string
  color: string
}

export interface Book {
  id: string
  title: string
  author: string
  isbn?: string | null
  publishedDate?: string | null
  pageCount?: number | null
  description?: string | null
  coverUrl?: string | null
  status: BookStatus
  categoryId?: string | null
  category?: Category | null
  createdAt: string
  updatedAt: string
}

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'

export interface Workspace {
  id: string
  name: string
  role: WorkspaceRole
}
