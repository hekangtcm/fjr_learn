import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category } from '@/types'

interface CategoryStore {
  categories: Category[]
  addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => Category
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  getCategoryById: (id: string) => Category | undefined
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: [],

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ categories: [...state.categories, newCategory] }))
        return newCategory
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        }))
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== id),
        }))
      },

      getCategoryById: (id) => {
        return get().categories.find((cat) => cat.id === id)
      },
    }),
    {
      name: 'booknest-categories',
    }
  )
)
