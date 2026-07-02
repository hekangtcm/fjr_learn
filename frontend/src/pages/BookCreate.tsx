import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BookForm, type BookFormData } from '@/components/book/BookForm'
import { useToast } from '@/components/ui/Toast'
import { useCreateBook } from '@/hooks/useBooks'

export default function BookCreate() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const createBook = useCreateBook()

  const handleSubmit = (data: BookFormData) => {
    createBook.mutate(data, {
      onSuccess: (newBook) => {
        showToast('success', '书籍添加成功')
        navigate(`/books/${newBook.id}`)
      },
      onError: () => {
        showToast('error', '添加失败')
      },
    })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">添加书籍</h1>
      </div>

      <BookForm onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
    </div>
  )
}
