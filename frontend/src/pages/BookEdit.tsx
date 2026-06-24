import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BookForm } from '@/components/book/BookForm'
import { useToast } from '@/components/ui/Toast'
import { useBookStore } from '@/stores/useBookStore'

export default function BookEdit() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { getBookById, updateBook } = useBookStore()

  const book = id ? getBookById(id) : undefined

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
        onSubmit={(data) => {
          updateBook(book.id, data)
          showToast('success', '书籍更新成功')
          navigate(`/books/${book.id}`)
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
