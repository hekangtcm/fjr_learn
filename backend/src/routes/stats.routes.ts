import { Router } from 'express'
import { getStats } from '../controllers/stats.controller'
import { authenticate } from '../middleware/auth'
import { resolveWorkspace } from '../middleware/workspace'

const router = Router()

router.get('/', authenticate, resolveWorkspace, getStats)

export default router
