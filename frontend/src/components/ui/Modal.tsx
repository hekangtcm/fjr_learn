import { type ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, footer, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className={cn(
          'w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-slate-800',
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
          {title ? (
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 dark:border-slate-700">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  description = '您确定要执行此操作吗？此操作无法撤销。',
  confirmText = '确认',
  cancelText = '取消',
  isLoading = false,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant="destructive" onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </Modal>
  )
}
