import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 dark:border-slate-700">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300">
        {message || '加载失败'}
      </p>
      <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
        请检查网络连接或稍后重试
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          重试
        </Button>
      )}
    </div>
  )
}
