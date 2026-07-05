import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { resolveWorkspace } from '../middleware/workspace'
import * as paymentController from '../controllers/payment.controller'

const router = Router()

router.use(authenticate, resolveWorkspace)

// 前端点击“模拟支付”调用这个接口
router.post('/mock/pay/:orderId', paymentController.mockPay)

// 模拟第三方支付平台回调，学习阶段可保留认证，也可单独做签名保护
router.post('/mock/callback', paymentController.callback)

export default router
