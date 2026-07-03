import { memo } from 'react'
import { BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Book, Category } from '@/types'

interface BookCardProps {
  book: Book
  category?: Category
  onClick?: () => void
}

const BookCard = memo(function BookCard({ book, category, onClick }: BookCardProps) {
  const statusMap = {
    OWNED: { label: '已拥有', variant: 'owned' as const },
    READING: { label: '在读', variant: 'reading' as const },
    FINISHED: { label: '已读', variant: 'finished' as const },
    WISHLIST: { label: '想读', variant: 'wishlist' as const },
  }

  const status = statusMap[book.status]

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5',
        onClick ? 'cursor-pointer' : ''
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Cover */}
          <div className="flex h-24 w-18 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={book.title}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <BookOpen className="h-8 w-8 text-slate-400" />
            )}
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                {book.title}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{book.author}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              {category && (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                  style={{
                    backgroundColor: `${category.color}20`,
                    color: category.color,
                  }}
                >
                  {category.name}
                </span>
              )}
              {book.pageCount && (
                <span className="text-xs text-slate-400">{book.pageCount}页</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export default BookCard
