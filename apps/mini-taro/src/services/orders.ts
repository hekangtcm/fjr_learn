import { request } from './request'

export interface Order {
  id: string
  orderNo: string
  amountCents: number
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'EXPIRED' | 'FAILED'
  expiresAt: string
  paidAt: string | null
  createdAt: string
  activityId: string
  userId: string
  workspaceId: string
  activity?: {
    id: string
    title: string
    startsAt: string
  }
  ticket?: {
    id: string
    code: string
  } | null
}

export async function getOrder(orderId: string) {
  return request<Order>({
    url: `/orders/${orderId}`,
  })
}

export async function listMyOrders() {
  return request<Order[]>({
    url: '/orders/my',
  })
}

export async function createOrder(activityId: string) {
  return request<Order>({
    url: '/orders',
    method: 'POST',
    data: { activityId },
  })
}
