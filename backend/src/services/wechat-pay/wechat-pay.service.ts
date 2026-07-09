import prisma from '@/lib/prisma'
import { ApiError } from '@/utils/errors'
import { wechatPayConfig } from '@/config/wechat-pay.config'
import { createMockPayParams } from './mock-pay.service'
import type { PrepayResult } from './types'

export async function createWechatPrepay(input: {
  orderId: string
  userId: string
  workspaceId: string
}): Promise<PrepayResult> {
  const order = await prisma.order.findFirst({
    where: {
      id: input.orderId,
      userId: input.userId,
      workspaceId: input.workspaceId,
    },
    include: {
      user: true,
      activity: true,
    },
  })

  if (!order) {
    throw new ApiError(404, '订单不存在')
  }

  if (order.status !== 'PENDING') {
    throw new ApiError(400, '订单状态不可支付')
  }

  if (order.expiresAt < new Date()) {
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'EXPIRED' },
    })
    throw new ApiError(400, '订单已过期')
  }

  if (!order.user.wechatOpenId) {
    throw new ApiError(400, '用户未绑定微信身份')
  }

  if (wechatPayConfig.mode === 'mock') {
    return createMockPayParams(order.id)
  }

  // real 模式：调用微信支付 JSAPI/小程序下单接口
  // 学习阶段无商户号，这里抛出错误或实现真实支付
  throw new ApiError(501, '真实微信支付未配置，请使用 mock 模式')
}
