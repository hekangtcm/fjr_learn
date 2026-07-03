import prisma from '../lib/prisma'
import { cache } from '../lib/cache'
import { notifyUser } from '../lib/socket'

export class StatsService {
  async getStats(userId: string) {
    const cacheKey = `stats:${userId}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const [totalBooks, statusBreakdown, averageRating, recentBooks] = await Promise.all([
          prisma.book.count({ where: { userId } }),
          prisma.book.groupBy({
            by: ['status'],
            where: { userId },
            _count: { status: true },
          }),
          prisma.review.aggregate({
            where: { user: { id: userId } },
            _avg: { rating: true },
          }),
          prisma.book.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { category: true },
          }),
        ])

        const statusMap = { OWNED: 0, READING: 0, FINISHED: 0, WISHLIST: 0 }
        statusBreakdown.forEach((s) => {
          statusMap[s.status as keyof typeof statusMap] = s._count.status
        })

        return {
          totalBooks,
          statusBreakdown: statusMap,
          averageRating: averageRating._avg.rating || 0,
          recentBooks,
        }
      },
      300 // 5 分钟 TTL
    )
  }
}

export const statsService = new StatsService()
