import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { bookKeys } from './query-keys'
import type { Book, BookStatus } from '@/types'

export interface BookFilters {
  page?: number
  pageSize?: number
  status?: BookStatus | 'ALL'
  query?: string
  categoryId?: string
}

export interface PaginatedBooks {
  items: Book[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 查询: 书籍列表
export function useBooks(filters: BookFilters = {}) {
  return useQuery<PaginatedBooks>({
    queryKey: bookKeys.list(filters as Record<string, unknown>),
    queryFn: async () => {
      const params: Record<string, unknown> = {}
      if (filters.page) params.page = filters.page
      if (filters.pageSize) params.pageSize = filters.pageSize
      if (filters.query) params.q = filters.query
      if (filters.categoryId) params.categoryId = filters.categoryId
      if (filters.status && filters.status !== 'ALL') params.status = filters.status
      const { data } = await apiClient.get('/books', { params })
      return data
    },
  })
}

// 查询: 书籍详情
export function useBook(id: string | undefined) {
  return useQuery<Book>({
    queryKey: bookKeys.detail(id || ''),
    queryFn: async () => {
      const { data } = await apiClient.get(`/books/${id}`)
      return data
    },
    enabled: !!id,
  })
}

// 变更: 创建书籍
export function useCreateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (bookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      const { data } = await apiClient.post('/books', bookData)
      return data as Book
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
    },
  })
}

// 变更: 更新书籍
export function useUpdateBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Book>) => {
      const { data } = await apiClient.put(`/books/${id}`, updates)
      return data as Book
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: bookKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
    },
  })
}

// 变更: 删除书籍 (乐观更新)
export function useDeleteBook() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/books/${id}`)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: bookKeys.lists() })
      const previousLists = queryClient.getQueriesData<PaginatedBooks>({ queryKey: bookKeys.lists() })
      queryClient.setQueriesData<PaginatedBooks>({ queryKey: bookKeys.lists() }, (old) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.filter((b) => b.id !== id),
          total: old.total - 1,
        }
      })
      return { previousLists }
    },
    onError: (_err, _id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([key, data]) => {
          queryClient.setQueryData(key, data)
        })
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookKeys.lists() })
    },
  })
}
