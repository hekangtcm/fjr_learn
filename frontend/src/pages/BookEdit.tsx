import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BookForm, type BookFormData } from '@/components/book/BookForm'
import { useToast } from '@/components/ui/Toast'
import { useBook, useUpdateBook } from '@/hooks/useBooks'
import { BookDetailSkeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'

export default function BookEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { data: book, isLoading, isError, error, refetch } = useBook(id)
  const updateBook = useUpdateBook()

  if (isLoading) return <BookDetailSkeleton />
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />

  if (!book) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 dark:text-slate-400">书籍不存在</p>
        <Button className="mt-4" onClick={() => navigate('/')}>
          返回书架
        </Button>
      </div>
    )
  }

  const handleSubmit = (data: BookFormData) => {
    updateBook.mutate(
      { id: book.id, ...data },
      {
        onSuccess: () => {
          showToast('success', '书籍更新成功')
          navigate(`/books/${book.id}`)
        },
        onError: () => {
          showToast('error', '更新失败')
        },
      }
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">编辑书籍</h1>
      </div>

      <BookForm
        defaultValues={{
          title: book.title,
          author: book.author,
          isbn: book.isbn || '',
          pageCount: book.pageCount,
          description: book.description || '',
          status: book.status,
          categoryId: book.categoryId || '',
          coverUrl: book.coverUrl || '',
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
