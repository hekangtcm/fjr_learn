import prisma from '../lib/prisma'
import { ApiError } from '../utils/errors'
import { cache } from '../lib/cache'
import { notifyUser } from '../lib/socket'
import logger from '../lib/logger'
import { writeAuditLog } from './audit.service'

export class BookService {
  async list(workspaceId: string, options: {
    page?: number
    pageSize?: number
    status?: string
    categoryId?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const page = Math.max(1, options.page || 1)
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 10))
    const skip = (page - 1) * pageSize

    const where: any = { workspaceId }
    if (options.status) where.status = options.status
    if (options.categoryId) where.categoryId = options.categoryId

    const cacheKey = `books:${workspaceId}:list:${JSON.stringify({ page, pageSize, ...options })}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const start = Date.now()
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
        logger.debug('Book list query', { workspaceId, page, pageSize, count: items.length, duration: `${Date.now() - start}ms` })
        return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
      },
      120
    )
  }

  async getById(workspaceId: string, bookId: string) {
    const cacheKey = `books:${workspaceId}:detail:${bookId}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const book = await prisma.book.findFirst({
          where: { id: bookId, workspaceId },
          include: { category: true, reviews: { include: { user: { select: { id: true, name: true } } } } },
        })
        if (!book) {
          throw new ApiError(404, 'Book not found')
        }
        return book
      },
      300
    )
  }

  async create(userId: string, workspaceId: string, data: any) {
    const book = await prisma.book.create({
      data: { ...data, userId, workspaceId },
      include: { category: true },
    })

    await this.invalidateCache(workspaceId)

    logger.info('Book created', { bookId: book.id, userId, workspaceId, title: book.title })

    await writeAuditLog({
      workspaceId,
      actorId: userId,
      action: 'book.created',
      entityType: 'Book',
      entityId: book.id,
      metadata: { title: book.title },
    })

    notifyUser(userId, 'book:created', {
      message: `《${book.title}》已添加到书架`,
      book,
    })

    return book
  }

  async update(userId: string, workspaceId: string, role: string, bookId: string, data: any) {
    const book = await prisma.book.findFirst({ where: { id: bookId, workspaceId } })
    if (!book) {
      throw new ApiError(404, 'Book not found')
    }

    const canEdit = ['OWNER', 'ADMIN'].includes(role) || (role === 'MEMBER' && book.userId === userId)
    if (!canEdit) {
      throw new ApiError(403, '无权编辑该书籍')
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data,
      include: { category: true },
    })

    await this.invalidateCache(workspaceId, bookId)

    logger.info('Book updated', { bookId, userId, workspaceId, title: updated.title })

    await writeAuditLog({
      workspaceId,
      actorId: userId,
      action: 'book.updated',
      entityType: 'Book',
      entityId: book.id,
      metadata: { title: updated.title },
    })

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

  async delete(userId: string, workspaceId: string, role: string, bookId: string) {
    const book = await prisma.book.findFirst({ where: { id: bookId, workspaceId } })
    if (!book) {
      throw new ApiError(404, 'Book not found')
    }

    const canDelete = ['OWNER', 'ADMIN'].includes(role) || (role === 'MEMBER' && book.userId === userId)
    if (!canDelete) {
      throw new ApiError(403, '无权删除该书籍')
    }

    await prisma.book.delete({ where: { id: bookId } })

    await this.invalidateCache(workspaceId, bookId)

    logger.info('Book deleted', { bookId, userId, workspaceId, title: book.title })

    await writeAuditLog({
      workspaceId,
      actorId: userId,
      action: 'book.deleted',
      entityType: 'Book',
      entityId: bookId,
      metadata: { title: book.title },
    })

    notifyUser(userId, 'book:deleted', {
      message: `《${book.title}》已从书架删除`,
      bookId,
    })

    return { id: bookId }
  }

  private async invalidateCache(workspaceId: string, bookId?: string) {
    await cache.del(`stats:${workspaceId}`)
    await cache.del(`books:${workspaceId}:*`)
    if (bookId) {
      await cache.del(`books:${workspaceId}:detail:${bookId}`)
    }
  }
}

export const bookService = new BookService()
