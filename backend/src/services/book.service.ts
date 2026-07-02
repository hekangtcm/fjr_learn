import prisma from '../lib/prisma'
import { ApiError } from '../utils/errors'

export class BookService {
  async list(userId: string, options: {
    page?: number
    pageSize?: number
    status?: string
    categoryId?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const page = Math.max(1, options.page || 1)
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 10))
    const skip = (page - 1) * pageSize

    const where: any = { userId }
    if (options.status) where.status = options.status
    if (options.categoryId) where.categoryId = options.categoryId

    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [options.sortBy || 'createdAt']: options.sortOrder || 'desc' },
        include: { category: true, _count: { select: { reviews: true } } },
      }),
      prisma.book.count({ where }),
    ])

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }

  async getById(userId: string, bookId: string) {
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: { category: true, reviews: { include: { user: { select: { id: true, name: true } } } } },
    })
    if (!book || book.userId !== userId) {
      throw new ApiError(404, 'Book not found')
    }
    return book
  }

  async create(userId: string, data: any) {
    return prisma.book.create({
      data: { ...data, userId },
      include: { category: true },
    })
  }

  async update(userId: string, bookId: string, data: any) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book || book.userId !== userId) {
      throw new ApiError(403, 'You can only update your own books')
    }
    return prisma.book.update({
      where: { id: bookId },
      data,
      include: { category: true },
    })
  }

  async delete(userId: string, bookId: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book || book.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own books')
    }
    await prisma.book.delete({ where: { id: bookId } })
    return { id: bookId }
  }
}

export const bookService = new BookService()
