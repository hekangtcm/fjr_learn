import prisma from '../lib/prisma'
import { cache } from '../lib/cache'
import { notifyUser } from '../lib/socket'

export class StatsService {
  async getStats(workspaceId: string) {
    const cacheKey = `stats:${workspaceId}`

    return cache.getOrSet(
      cacheKey,
      async () => {
        const [totalBooks, statusBreakdown, averageRating, recentBooks] = await Promise.all([
          prisma.book.count({ where: { workspaceId } }),
          prisma.book.groupBy({
            by: ['status'],
            where: { workspaceId },
            _count: { status: true },
          }),
          prisma.review.aggregate({
            where: { book: { workspaceId } },
            _avg: { rating: true },
          }),
          prisma.book.findMany({
            where: { workspaceId },
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
