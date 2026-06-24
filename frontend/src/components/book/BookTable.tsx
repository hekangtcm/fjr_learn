import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import type { Book, Category } from '@/types'

interface BookTableProps {
  books: Book[]
  getCategory: (id?: string) => Category | undefined
}

export default function BookTable({ books, getCategory }: BookTableProps) {
  const navigate = useNavigate()

  const statusMap = {
    OWNED: { label: '已拥有', variant: 'owned' as const },
    READING: { label: '在读', variant: 'reading' as const },
    FINISHED: { label: '已读', variant: 'finished' as const },
    WISHLIST: { label: '想读', variant: 'wishlist' as const },
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-800">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">书名</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">作者</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">状态</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">分类</th>
            <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">添加时间</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {books.map((book) => {
            const category = getCategory(book.categoryId)
            const status = statusMap[book.status]
            return (
              <tr
                key={book.id}
                className="cursor-pointer bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                onClick={() => navigate(`/books/${book.id}`)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-8 items-center justify-center rounded bg-slate-100 dark:bg-slate-700">
                      {book.coverUrl ? (
                        <img src={book.coverUrl} alt="" className="h-full w-full rounded object-cover" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{book.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{book.author}</td>
                <td className="px-4 py-3">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  {category ? (
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.name}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400">
                  {new Date(book.createdAt).toLocaleDateString('zh-CN')}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
