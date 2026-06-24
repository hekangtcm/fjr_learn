import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BookForm } from '@/components/book/BookForm'
import { useToast } from '@/components/ui/Toast'
import { useBookStore } from '@/stores/useBookStore'

export default function BookCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { addBook } = useBookStore()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">添加书籍</h1>
      </div>

      <BookForm
        onSubmit={(data) => {
          const book = addBook(data)
          showToast('success', '书籍添加成功')
          navigate(`/books/${book.id}`)
        }}
        onCancel={() => navigate(-1)}
      />
    </div>
  )
}
