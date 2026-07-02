import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import type { Book } from '@/types'

export const mockBooks: Book[] = [
  {
    id: '1',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    status: 'READING',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'Design Patterns',
    author: 'Gang of Four',
    status: 'OWNED',
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
]

export const handlers = [
  http.get('*/api/v1/books', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        items: mockBooks,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
    })
  }),

  http.get('*/api/v1/books/:id', ({ params }) => {
    const book = mockBooks.find((b) => b.id === params.id)
    if (!book) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ code: 200, message: 'success', data: book })
  }),

  http.post('*/api/v1/books', async ({ request }) => {
    const body = (await request.json()) as Omit<Book, 'id' | 'createdAt' | 'updatedAt'>
    const newBook: Book = {
      ...body,
      id: '3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return HttpResponse.json({ code: 201, message: 'success', data: newBook }, { status: 201 })
  }),

  http.get('*/api/v1/categories', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: [
        { id: 'c1', name: '技术', color: '#3B82F6', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
      ],
    })
  }),

  http.get('*/api/v1/stats', () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        totalBooks: 2,
        statusBreakdown: { OWNED: 1, READING: 1, FINISHED: 0, WISHLIST: 0 },
        averageRating: 0,
        recentBooks: mockBooks,
      },
    })
  }),
]

export const server = setupServer(...handlers)
