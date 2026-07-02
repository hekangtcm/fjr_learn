import prisma from '../lib/prisma'

export class StatsService {
  async getStats(userId: string) {
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
  }
}

export const statsService = new StatsService()
