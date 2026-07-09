import { Router } from 'express'
import activityRoutes from './activity.routes'
import orderRoutes from './order.routes'
import paymentRoutes from './payment.routes'
import importRoutes from './import.routes'
import wechatRoutes from './wechat.routes'
import { authenticate } from '../middleware/auth'
import { resolveWorkspace } from '../middleware/workspace'
import { exportBooks } from '../controllers/export.controller'
import authRoutes from './auth.routes'
import bookRoutes from './book.routes'
import categoryRoutes from './category.routes'
import reviewRoutes from './review.routes'
import statsRoutes from './stats.routes'
import workspaceRoutes from './workspace.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/wechat', wechatRoutes)
router.use('/books', bookRoutes)
router.use('/books', reviewRoutes)
router.use('/categories', categoryRoutes)
router.use('/stats', statsRoutes)
router.use('/workspaces', workspaceRoutes)
router.use('/activities', activityRoutes)
router.use('/orders', orderRoutes)
router.use('/payments', paymentRoutes)
router.use('/imports', importRoutes)
router.get('/exports/books', authenticate, resolveWorkspace, exportBooks)

export default router
