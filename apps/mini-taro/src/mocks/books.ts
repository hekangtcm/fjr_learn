import type { Book, Category, Workspace } from '@booknest/domain'

export const mockCategories: Category[] = [
  { id: 'cat-1', name: '技术', color: '#2563eb' },
  { id: 'cat-2', name: '文学', color: '#db2777' },
  { id: 'cat-3', name: '历史', color: '#16a34a' },
  { id: 'cat-4', name: '科学', color: '#ea580c' },
]

export const mockWorkspaces: Workspace[] = [
  { id: 'ws-1', name: '我的书架', role: 'OWNER' },
]

export const mockBooks: Book[] = [
  {
    id: 'book-1',
    title: '深入理解 TypeScript',
    author: 'Marius Schulz',
    status: 'READING',
    pageCount: 320,
    coverUrl: '',
    categoryId: 'cat-1',
    category: mockCategories[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    status: 'OWNED',
    pageCount: 360,
    coverUrl: '',
    categoryId: 'cat-2',
    category: mockCategories[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'book-3',
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    status: 'FINISHED',
    pageCount: 440,
    coverUrl: '',
    categoryId: 'cat-3',
    category: mockCategories[2],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
