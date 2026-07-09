import { Router } from 'express'
import { z } from 'zod'
import crypto from 'node:crypto'
import { authenticate } from '@/middleware/auth'
import { resolveWorkspace } from '@/middleware/workspace'
import { ResponseUtil } from '@/utils/response'
import { ApiError } from '@/utils/errors'
import { createWechatPrepay } from '@/services/wechat-pay/wechat-pay.service'
import { handlePaymentCallback } from '@/services/payment.service'
import type { MockPaymentPayload } from '@/lib/mockPayment'

const router = Router()

// Step 3: 预支付接口
const prepaySchema = z.object({
  orderId: z.string().min(1),
})

router.post('/prepay', authenticate, resolveWorkspace, async (req, res, next) => {
  try {
    const { orderId } = prepaySchema.parse(req.body)
    const result = await createWechatPrepay({
      orderId,
      userId: req.user!.id,
      workspaceId: req.workspace!.id,
    })

    ResponseUtil.success(res, result)
  } catch (error) {
    next(error)
  }
})

// Step 4: Mock callback route（仅限开发环境）
const mockCallbackSchema = z.object({
  orderId: z.string().min(1),
  success: z.boolean().default(true),
})

router.post('/mock-callback', authenticate, async (req, res, next) => {
  try {
    // 双重检查：必须是非生产环境 AND mock 模式
    if (process.env.NODE_ENV === 'production' || process.env.WECHAT_PAY_MODE !== 'mock') {
      throw new ApiError(403, 'production disabled')
    }

    const { orderId, success } = mockCallbackSchema.parse(req.body)

    if (!success) {
      throw new ApiError(400, '模拟支付失败')
    }

    // 查询订单信息构造回调 payload
    const prisma = (await import('@/lib/prisma')).default
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) throw new ApiError(404, '订单不存在')

    const payload: MockPaymentPayload = {
      eventId: `evt_mock_${crypto.randomUUID()}`,
      orderNo: order.orderNo,
      amountCents: order.amountCents,
      paidAt: new Date().toISOString(),
      status: 'SUCCESS',
    }

    // 复用同一套支付成功处理 service，不另写绕过事务的逻辑
    const { signPaymentPayload } = await import('@/lib/mockPayment')
    const signature = signPaymentPayload(payload)
    const result = await handlePaymentCallback(payload, signature)

    ResponseUtil.success(res, result, '模拟回调处理成功')
  } catch (error) {
    next(error)
  }
})

// 真实微信支付回调接口（占位，学习阶段返回 501）
router.post('/notify', async (req, res) => {
  if (process.env.WECHAT_PAY_MODE !== 'real') {
    return res.status(403).json({ code: 403, message: 'real mode required' })
  }

  // 真实微信支付回调处理：
  // 1. 验证微信支付回调签名
  // 2. 解密 resource 得到支付结果
  // 3. 校验 outTradeNo、amount、mchId、appid
  // 4. 插入 PaymentEvent（幂等）
  // 5. 开启事务：更新订单 + 创建 Ticket
  // 6. 返回 200/204
  return res.status(501).json({ code: 501, message: 'real wechat pay notify not implemented' })
})

export default router
