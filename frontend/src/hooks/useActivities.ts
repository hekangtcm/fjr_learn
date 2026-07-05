import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data } = await apiClient.get('/activities')
      return data
    },
  })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (activityId: string) => {
      const { data } = await apiClient.post('/orders', { activityId })
      return data
    },
  })
}

export function useMockPay() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data } = await apiClient.post(`/payments/mock/pay/${orderId}`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
  })
}
