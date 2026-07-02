import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, BookOpen, Calendar, Hash, FileText, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useBook, useDeleteBook } from '@/hooks/useBooks'
import { useCategories } from '@/hooks/useCategories'
import { BookDetailSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

export default function BookDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const { data: book, isLoading, isError, error, refetch } = useBook(id)
  const { data: categories } = useCategories()
  const deleteBook = useDeleteBook()

  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const category = book?.categoryId
    ? categories?.find((c) => c.id === book.categoryId)
    : undefined

  const statusMap = {
    OWNED: { label: '已拥有', variant: 'owned' as const },
    READING: { label: '在读', variant: 'reading' as const },
    FINISHED: { label: '已读', variant: 'finished' as const },
    WISHLIST: { label: '想读', variant: 'wishlist' as const },
  }

  if (isLoading) return <BookDetailSkeleton />
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />
  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">书籍不存在</p>
        <Button className="mt-4" onClick={() => navigate('/')}>返回书架</Button>
      </div>
    )
  }

  const status = statusMap[book.status]

  const handleDelete = () => {
    deleteBook.mutate(book.id, {
      onSuccess: () => {
        showToast('success', '书籍已删除')
        setShowDeleteModal(false)
        navigate('/')
      },
      onError: () => {
        showToast('error', '删除失败')
        setShowDeleteModal(false)
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">书籍详情</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* Cover */}
          <div className="flex h-48 w-36 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-700">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <BookOpen className="h-16 w-16 text-slate-300 dark:text-slate-600" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{book.title}</h2>
              <p className="mt-1 text-slate-500 dark:text-slate-400">{book.author}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              {category && (
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <Tag className="mr-1 h-3 w-3" />
                  {category.name}
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {book.isbn && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-slate-400" />
                  <span>ISBN: {book.isbn}</span>
                </div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>{book.pageCount} 页</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>添加于 {new Date(book.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          </div>
        </div>

        {book.description && (
          <div className="mt-6 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">描述</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
              {book.description}
            </p>
          </div>
        )}

        <div className="mt-6 flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Button variant="outline" onClick={() => navigate(`/books/${book.id}/edit`)}>
            <Edit className="h-4 w-4" />
            编辑
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="删除书籍"
        description={`确定要删除《${book.title}》吗？此操作无法撤销。`}
        confirmText="删除"
        isLoading={deleteBook.isPending}
      />
    </div>
  )
}
