import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { reviewKeys } from './query-keys'

export interface Review {
  id: string
  rating: number
  text?: string
  createdAt: string
  updatedAt: string
  userId: string
  bookId: string
  user?: {
    id: string
    name: string
  }
}

// 查询: 书籍评论
export function useReviews(bookId: string | undefined) {
  return useQuery<Review[]>({
    queryKey: reviewKeys.byBook(bookId || ''),
    queryFn: async () => {
      const { data } = await apiClient.get(`/books/${bookId}/reviews`)
      return data
    },
    enabled: !!bookId,
  })
}

// 变更: 创建评论
export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ bookId, rating, text }: { bookId: string; rating: number; text?: string }) => {
      const { data } = await apiClient.post(`/books/${bookId}/reviews`, { rating, text })
      return data as Review
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.byBook(variables.bookId) })
    },
  })
}
