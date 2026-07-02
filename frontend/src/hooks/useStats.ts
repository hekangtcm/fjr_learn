import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export interface StatsData {
  totalBooks: number
  statusBreakdown: Record<string, number>
  averageRating: number
  recentBooks: unknown[]
}

export function useStats() {
  return useQuery<StatsData>({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await apiClient.get('/stats')
      return data
    },
  })
}
