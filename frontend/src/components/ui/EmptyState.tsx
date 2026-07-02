import { BookOpen, Plus } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title = '还没有书籍',
  description = '点击上方按钮添加你的第一本书',
  actionLabel = '添加书籍',
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 dark:border-slate-700">
      <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
      <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
        {description}
      </p>
      {onAction && (
        <Button className="mt-4" onClick={onAction}>
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
