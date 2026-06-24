import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Book, BookStatus } from '@/types'

interface BookStore {
  books: Book[]
  addBook: (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>) => Book
  updateBook: (id: string, updates: Partial<Omit<Book, 'id' | 'createdAt'>>) => void
  deleteBook: (id: string) => void
  getBookById: (id: string) => Book | undefined
  getBooksByStatus: (status: BookStatus) => Book[]
  searchBooks: (query: string) => Book[]
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
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

      updateBook: (id, updates) => {
        set((state) => ({
          books: state.books.map((book) =>
            book.id === id
              ? { ...book, ...updates, updatedAt: new Date().toISOString() }
              : book
          ),
        }))
      },

      deleteBook: (id) => {
        set((state) => ({ books: state.books.filter((book) => book.id !== id) }))
      },

      getBookById: (id) => {
        return get().books.find((book) => book.id === id)
      },

      getBooksByStatus: (status) => {
        return get().books.filter((book) => book.status === status)
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
    }),
    {
      name: 'booknest-books',
    }
  )
)
