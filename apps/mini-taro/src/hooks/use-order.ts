import { useQuery } from '@tanstack/react-query'
import { getOrder } from '@/services/orders'

export const orderKeys = {
  detail: (id: string) => ['orders', 'detail', id] as const,
  list: () => ['orders', 'list'] as const,
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrder(orderId),
    enabled: Boolean(orderId),
  })
}
