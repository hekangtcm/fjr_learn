import { Router } from 'express'
import { getStats } from '../controllers/stats.controller'
import { authenticate } from '../middleware/auth'

const router = Router()

router.get('/', authenticate, getStats)

export default router
