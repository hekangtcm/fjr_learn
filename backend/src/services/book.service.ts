import prisma from '../lib/prisma'
import { ApiError } from '../utils/errors'
import { cache } from '../lib/cache'
import { notifyUser } from '../lib/socket'

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

    const cacheKey = `books:${userId}:list:${JSON.stringify({ page, pageSize, ...options })}`

    return cache.getOrSet(
      cacheKey,
      async () => {
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
      },
      120 // 2 分钟 TTL
    )
  }

  async getById(userId: string, bookId: string) {
    const cacheKey = `books:${userId}:detail:${bookId}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const book = await prisma.book.findUnique({
          where: { id: bookId },
          include: { category: true, reviews: { include: { user: { select: { id: true, name: true } } } } },
        })
        if (!book || book.userId !== userId) {
          throw new ApiError(404, 'Book not found')
        }
        return book
      },
      300 // 5 分钟 TTL
    )
  }

  async create(userId: string, data: any) {
    const book = await prisma.book.create({
      data: { ...data, userId },
      include: { category: true },
    })

    await this.invalidateCache(userId)

    notifyUser(userId, 'book:created', {
      message: `《${book.title}》已添加到书架`,
      book,
    })

    return book
  }

  async update(userId: string, bookId: string, data: any) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book || book.userId !== userId) {
      throw new ApiError(403, 'You can only update your own books')
    }
    const updated = await prisma.book.update({
      where: { id: bookId },
      data,
      include: { category: true },
    })

    await this.invalidateCache(userId, bookId)

    const statusLabels: Record<string, string> = {
      OWNED: '已拥有', READING: '在读', FINISHED: '已读完', WISHLIST: '想读',
    }
    if (data.status && data.status !== book.status) {
      notifyUser(userId, 'book:statusChanged', {
        message: `《${updated.title}》状态更新为「${statusLabels[data.status] || data.status}」`,
        book: updated,
      })
    }

    return updated
  }

  async delete(userId: string, bookId: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book || book.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own books')
    }
    await prisma.book.delete({ where: { id: bookId } })

    await this.invalidateCache(userId, bookId)

    notifyUser(userId, 'book:deleted', {
      message: `《${book.title}》已从书架删除`,
      bookId,
    })

    return { id: bookId }
  }

  private async invalidateCache(userId: string, bookId?: string) {
    await cache.del(`stats:${userId}`)
    await cache.del(`books:${userId}:*`)
    if (bookId) {
      await cache.del(`books:${userId}:detail:${bookId}`)
    }
  }
}

export const bookService = new BookService()
