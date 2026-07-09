import { useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useOrder } from '@/hooks/use-order'

const statusMap: Record<string, { title: string; desc: string; color: string }> = {
  PENDING: { title: '支付确认中', desc: '请稍候，正在确认支付结果...', color: '#f59e0b' },
  PAID: { title: '报名成功', desc: 'Ticket 已生成，请查看活动详情', color: '#10b981' },
  FAILED: { title: '支付失败', desc: '支付未成功，请重新尝试', color: '#ef4444' },
  CANCELLED: { title: '支付已取消', desc: '您已取消支付，可重新报名', color: '#64748b' },
  EXPIRED: { title: '订单已过期', desc: '订单已过期，请重新报名', color: '#64748b' },
}

export default function OrderResultPage() {
  const router = useRouter()
  const orderId = router.params.orderId || ''

  const { data: order, isLoading, isError } = useOrder(orderId)

  const statusInfo = order ? statusMap[order.status] : statusMap.PENDING

  // 页面加载时如果 orderId 缺失，提示并返回
  useEffect(() => {
    if (!orderId) {
      Taro.showToast({ title: '缺少订单ID', icon: 'none' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  }, [orderId])

  const handleBack = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  const handleRetry = () => {
    if (orderId) {
      Taro.redirectTo({ url: `/sub/orders/pages/result/index?orderId=${orderId}` })
    }
  }

  if (isLoading) {
    return (
      <View className="page result-page">
        <View className="result-loading">
          <Text className="result-loading__text">加载中...</Text>
        </View>
      </View>
    )
  }

  if (isError || !order) {
    return (
      <View className="page result-page">
        <View className="result-error">
          <Text className="result-error__title">加载失败</Text>
          <Text className="result-error__desc">无法获取订单信息</Text>
          <Button className="result-btn" onClick={handleRetry}>重试</Button>
        </View>
      </View>
    )
  }

  return (
    <View className="page result-page">
      <View className="result-card">
        <View
          className="result-icon"
          style={{ backgroundColor: `${statusInfo.color}20` }}
        >
          <Text style={{ color: statusInfo.color, fontSize: '48px' }}>
            {order.status === 'PAID' ? '✓' : order.status === 'PENDING' ? '⏳' : '✕'}
          </Text>
        </View>
        <Text className="result-title">{statusInfo.title}</Text>
        <Text className="result-desc">{statusInfo.desc}</Text>

        {order.ticket && (
          <View className="result-ticket">
            <Text className="result-ticket__label">Ticket 号码</Text>
            <Text className="result-ticket__code">{order.ticket.code}</Text>
          </View>
        )}

        {order.activity && (
          <View className="result-activity">
            <Text className="result-activity__label">活动</Text>
            <Text className="result-activity__title">{order.activity.title}</Text>
          </View>
        )}

        <View className="result-order">
          <Text className="result-order__label">订单号</Text>
          <Text className="result-order__no">{order.orderNo}</Text>
        </View>
      </View>

      <View className="result-actions">
        <Button className="result-btn result-btn--primary" onClick={handleBack}>
          返回首页
        </Button>
      </View>
    </View>
  )
}
