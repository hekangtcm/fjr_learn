import { useState } from 'react'
import { useActivities, useCreateOrder, useMockPay } from '@/hooks/useActivities'

export function Activities() {
  const { data: activities = [] } = useActivities()
  const createOrder = useCreateOrder()
  const mockPay = useMockPay()
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const [paidResult, setPaidResult] = useState<any>(null)

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">读书会活动</h1>

      {activities.map((activity: any) => (
        <div key={activity.id} className="rounded border p-4">
          <h2 className="font-semibold">{activity.title}</h2>
          <p className="text-sm text-gray-500">
            名额：{activity.registeredCount}/{activity.capacity}
          </p>
          <p className="text-sm">价格：¥{(activity.priceCents / 100).toFixed(2)}</p>

          <button
            data-testid={`activity-register-${activity.id}`}
            onClick={() =>
              createOrder.mutate(activity.id, {
                onSuccess: (order: any) => {
                  setPendingOrder(order)
                  setPaidResult(null)
                },
              })
            }
            disabled={createOrder.isPending || activity.registeredCount >= activity.capacity}
            className="mt-2 rounded bg-blue-600 px-4 py-2 text-white disabled:bg-gray-400"
          >
            {activity.registeredCount >= activity.capacity ? '已满员' : '报名'}
          </button>
        </div>
      ))}

      {pendingOrder && !paidResult && (
        <div className="rounded border p-4 bg-yellow-50">
          <h2 className="font-semibold">待支付订单：{pendingOrder.orderNo}</h2>
          <p className="text-sm text-gray-600">金额：¥{(pendingOrder.amountCents / 100).toFixed(2)}</p>
          <button
            data-testid="mock-pay-button"
            onClick={() =>
              mockPay.mutate(pendingOrder.id, {
                onSuccess: (data: any) => setPaidResult(data),
              })
            }
            disabled={mockPay.isPending}
            className="mt-2 rounded bg-green-600 px-4 py-2 text-white disabled:bg-gray-400"
          >
            模拟支付
          </button>
        </div>
      )}

      {paidResult && (
        <div className="rounded border p-4 bg-green-50">
          <h2 className="font-semibold text-green-700">报名成功！</h2>
          <p className="text-sm">Ticket Code: {paidResult.ticket?.code}</p>
        </div>
      )}
    </div>
  )
}
