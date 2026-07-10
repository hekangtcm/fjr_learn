import { Router } from 'express'
import { ResponseUtil } from '../utils/response'
import prisma from '../lib/prisma'
import { authenticate } from '../middleware/auth'

const router = Router()

router.use(authenticate)

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      take: 100,
    })
    ResponseUtil.success(res, users)
  } catch (error) {
    next(error)
  }
})

export default router
