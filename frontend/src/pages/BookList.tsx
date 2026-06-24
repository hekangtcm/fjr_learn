import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Grid3X3, List, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useBookStore } from '@/stores/useBookStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import BookCard from '@/components/book/BookCard'
import BookTable from '@/components/book/BookTable'
import type { BookStatus } from '@/types'
import { cn } from '@/lib/utils'

const statusTabs: { value: BookStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '全部' },
  { value: 'OWNED', label: '已拥有' },
  { value: 'READING', label: '在读' },
  { value: 'FINISHED', label: '已读' },
  { value: 'WISHLIST', label: '想读' },
]

export default function BookList() {
  const navigate = useNavigate()
  const { searchBooks } = useBookStore()
  const { getCategoryById } = useCategoryStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<BookStatus | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const allBooks = searchBooks(searchQuery)
  const filteredBooks = activeTab === 'ALL' ? allBooks : allBooks.filter((book) => book.status === activeTab)

  const getCategory = (id?: string) => (id ? getCategoryById(id) : undefined)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">我的书架</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            共 {filteredBooks.length} 本书
          </p>
        </div>
        <Button onClick={() => navigate('/books/new')}>
          <Plus className="h-4 w-4" />
          添加书籍
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="搜索书名或作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'grid'
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
            title="网格视图"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'rounded-lg p-2 transition-colors',
              viewMode === 'table'
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            )}
            title="列表视图"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-primary-600 text-white dark:bg-primary-700'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Book List */}
      {filteredBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 py-16 dark:border-slate-700">
          <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-lg font-medium text-slate-500 dark:text-slate-400">
            还没有书籍
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            点击上方按钮添加你的第一本书
          </p>
          <Button className="mt-4" onClick={() => navigate('/books/new')}>
            <Plus className="h-4 w-4" />
            添加书籍
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              category={getCategory(book.categoryId)}
              onClick={() => navigate(`/books/${book.id}`)}
            />
          ))}
        </div>
      ) : (
        <BookTable books={filteredBooks} getCategory={getCategory} />
      )}
    </div>
  )
}
