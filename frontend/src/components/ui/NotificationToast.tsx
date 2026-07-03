import { Bell, X, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'
import { cn } from '@/lib/utils'

export function NotificationToast() {
  const { notifications, connected, dismiss } = useSocket()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* 连接状态指示器 */}
      <div className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        connected
          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      )}>
        {connected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        {connected ? '实时连接' : '离线'}
      </div>

      {/* 通知列表 */}
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 animate-in slide-in-from-right"
        >
          <Bell className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
          <div className="flex-1">
            <p className="text-sm text-slate-900 dark:text-slate-100">{n.message}</p>
            <p className="mt-0.5 text-xs text-slate-400">
              {n.timestamp.toLocaleTimeString('zh-CN')}
            </p>
          </div>
          <button
            onClick={() => dismiss(n.id)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
