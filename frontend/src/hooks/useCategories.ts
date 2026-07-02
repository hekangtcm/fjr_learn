import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { categoryKeys } from './query-keys'
import type { Category } from '@/types'

// 查询: 分类列表
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const { data } = await apiClient.get('/categories')
      return data
    },
  })
}

// 变更: 创建分类
export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      const { data } = await apiClient.post('/categories', categoryData)
      return data as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}

// 变更: 更新分类
export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Category>) => {
      const { data: updated } = await apiClient.put(`/categories/${id}`, data)
      return updated as Category
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
    },
  })
}

// 变更: 删除分类
export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.list() })
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })
}
