import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  showToast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right',
        bgColors[toast.type]
      )}
    >
      {icons[toast.type]}
      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {toast.message}
      </span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-2 rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
