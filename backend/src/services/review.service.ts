import prisma from '../lib/prisma'
import { ApiError } from '../utils/errors'

export class ReviewService {
  async listByBook(userId: string, bookId: string) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book || book.userId !== userId) {
      throw new ApiError(404, 'Book not found')
    }
    return prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(userId: string, bookId: string, data: { rating: number; text?: string }) {
    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book || book.userId !== userId) {
      throw new ApiError(404, 'Book not found')
    }
    return prisma.review.create({
      data: { ...data, bookId, userId },
      include: { user: { select: { id: true, name: true } } },
    })
  }
}

export const reviewService = new ReviewService()
