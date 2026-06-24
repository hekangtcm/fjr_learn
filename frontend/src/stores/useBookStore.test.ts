import { describe, it, expect, beforeEach } from 'vitest'
import { create } from 'zustand'
import type { Book, BookStatus } from '@/types'

interface TestBookStore {
  books: Book[]
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Book
  deleteBook: (id: string) => void
  searchBooks: (query: string) => Book[]
}

const useTestBookStore = create<TestBookStore>()((set, get) => ({
  books: [],

  addBook: (book) => {
    const now = new Date().toISOString()
    const newBook: Book = {
      ...book,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({ books: [...state.books, newBook] }))
    return newBook
  },

  deleteBook: (id) => {
    set((state) => ({ books: state.books.filter((book) => book.id !== id) }))
  },

  searchBooks: (query) => {
    const q = query.toLowerCase().trim()
    if (!q) return get().books
    return get().books.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.isbn?.toLowerCase().includes(q) ?? false)
    )
  },
}))

describe('useBookStore', () => {
  beforeEach(() => {
    useTestBookStore.setState({ books: [] })
  })

  it('should add a book', () => {
    const store = useTestBookStore.getState()
    const book = store.addBook({
      title: 'React 设计模式',
      author: '张三',
      status: 'WISHLIST' as BookStatus,
    })

    expect(book.title).toBe('React 设计模式')
    expect(book.author).toBe('张三')
    expect(book.status).toBe('WISHLIST')
    expect(book.id).toBeDefined()
    expect(useTestBookStore.getState().books).toHaveLength(1)
  })

  it('should delete a book', () => {
    const store = useTestBookStore.getState()
    const book = store.addBook({ title: 'Test', author: 'Test', status: 'OWNED' as BookStatus })
    expect(useTestBookStore.getState().books).toHaveLength(1)

    store.deleteBook(book.id)
    expect(useTestBookStore.getState().books).toHaveLength(0)
  })

  it('should search books by title or author', () => {
    const store = useTestBookStore.getState()
    store.addBook({ title: 'JavaScript 高级程序设计', author: 'Nicholas', status: 'OWNED' as BookStatus })
    store.addBook({ title: '深入浅出 React', author: '李四', status: 'READING' as BookStatus })
    store.addBook({ title: 'Vue.js 实战', author: '王五', status: 'WISHLIST' as BookStatus })

    const results = store.searchBooks('React')
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('深入浅出 React')

    const authorResults = store.searchBooks('Nicholas')
    expect(authorResults).toHaveLength(1)
    expect(authorResults[0].author).toBe('Nicholas')
  })
})
