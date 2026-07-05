import type { Request, Response, NextFunction } from 'express'
import { ResponseUtil } from '../utils/response'
import * as paymentService from '../services/payment.service'

export async function mockPay(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.createMockPaymentCallback(req.params.orderId as string)
    ResponseUtil.success(res, result, '支付成功')
  } catch (err) {
    next(err)
  }
}

export async function callback(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await paymentService.handlePaymentCallback(req.body.payload, req.body.signature)
    ResponseUtil.success(res, result, '回调处理成功')
  } catch (err) {
    next(err)
  }
}
