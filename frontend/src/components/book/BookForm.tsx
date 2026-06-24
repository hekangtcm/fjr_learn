import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useCategoryStore } from '@/stores/useCategoryStore'
import type { BookStatus } from '@/types'

const bookSchema = z.object({
  title: z.string().min(1, '书名不能为空').max(200, '书名不超过200字'),
  author: z.string().min(1, '作者不能为空').max(100, '作者不超过100字'),
  isbn: z.string().regex(/^(?:\d{10}|\d{13})$/, 'ISBN格式不正确').optional().or(z.literal('')),
  pageCount: z.number().positive('页数必须大于0').optional(),
  description: z.string().max(2000, '描述不超过2000字').optional(),
  coverUrl: z.string().url('请输入有效的URL').optional().or(z.literal('')),
  status: z.enum(['OWNED', 'READING', 'FINISHED', 'WISHLIST']),
  categoryId: z.string().optional().or(z.literal('')),
})

export type BookFormData = z.infer<typeof bookSchema>

interface BookFormProps {
  defaultValues?: Partial<BookFormData>
  onSubmit: (data: BookFormData) => void
  onCancel: () => void
}

export function BookForm({ defaultValues, onSubmit, onCancel }: BookFormProps) {
  const { categories } = useCategoryStore()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      status: 'WISHLIST' as BookStatus,
      ...defaultValues,
    },
  })

  const statusOptions = [
    { value: 'OWNED', label: '已拥有' },
    { value: 'READING', label: '在读' },
    { value: 'FINISHED', label: '已读' },
    { value: 'WISHLIST', label: '想读' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="书名"
          placeholder="请输入书名"
          required
          {...register('title')}
          error={errors.title?.message}
        />
        <Input
          label="作者"
          placeholder="请输入作者"
          required
          {...register('author')}
          error={errors.author?.message}
        />
        <Input
          label="ISBN"
          placeholder="10位或13位数字"
          {...register('isbn')}
          error={errors.isbn?.message}
        />
        <Input
          label="页数"
          type="number"
          placeholder="请输入页数"
          {...register('pageCount', { valueAsNumber: true })}
          error={errors.pageCount?.message}
        />
      </div>

      <Input
        label="封面URL"
        placeholder="https://example.com/cover.jpg"
        {...register('coverUrl')}
        error={errors.coverUrl?.message}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            阅读状态
          </label>
          <select
            {...register('status')}
            className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
            分类
          </label>
          <select
            {...register('categoryId')}
            className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">未分类</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          描述
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="请输入书籍描述..."
          className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          保存
        </Button>
      </div>
    </form>
  )
}
