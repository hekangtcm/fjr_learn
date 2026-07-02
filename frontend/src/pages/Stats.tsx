import { BookOpen, CheckCircle, Clock, Library, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { useStats } from '@/hooks/useStats'
import { useBooks } from '@/hooks/useBooks'
import { useCategories } from '@/hooks/useCategories'
import { StatsSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

export default function Stats() {
  const { data: statsData, isLoading: statsLoading, isError: statsError, error, refetch } = useStats()
  const { data: booksData } = useBooks({ page: 1, pageSize: 10 })
  const { data: categories } = useCategories()

  const total = statsData?.totalBooks || 0
  const breakdown = statsData?.statusBreakdown || {}
  const owned = breakdown['OWNED'] || 0
  const reading = breakdown['READING'] || 0
  const finished = breakdown['FINISHED'] || 0
  const wishlist = breakdown['WISHLIST'] || 0
  const avgRating = statsData?.averageRating || 0

  const stats = [
    { label: '书籍总数', value: total, icon: Library, color: 'bg-blue-500' },
    { label: '已拥有', value: owned, icon: BookOpen, color: 'bg-green-500' },
    { label: '在读', value: reading, icon: Clock, color: 'bg-blue-500' },
    { label: '已读', value: finished, icon: CheckCircle, color: 'bg-purple-500' },
    { label: '想读', value: wishlist, icon: Sparkles, color: 'bg-amber-500' },
  ]

  const recentBooks = statsData?.recentBooks || []
  const completionRate = total > 0 ? Math.round((finished / total) * 100) : 0

  if (statsLoading) return <StatsSkeleton />
  if (statsError) return <ErrorState message={error?.message} onRetry={refetch} />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">统计仪表盘</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completion Rate */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">阅读完成率</h3>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">{completionRate}%</span>
              <span className="text-slate-400">{finished}/{total} 本</span>
            </div>
            <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <p className="mt-2 text-sm text-slate-500">平均评分: {avgRating.toFixed(1)} / 5</p>
        </CardContent>
      </Card>

      {/* Recent Books */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">最近添加</h3>
          {recentBooks.length > 0 ? (
            <div className="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
              {recentBooks.map((book: any) => (
                <div key={book.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{book.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{book.author}</p>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(book.createdAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">还没有添加书籍</p>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">分类分布</h3>
          {categories && categories.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-3">
              {categories.map((cat) => {
                const count = booksData?.items?.filter((b) => b.categoryId === cat.id).length || 0
                return (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                    style={{ backgroundColor: `${cat.color}15` }}
                  >
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span style={{ color: cat.color }}>{cat.name}</span>
                    <span className="text-slate-500">({count})</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">还没有分类</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
