import { Router } from 'express'
import { authenticate } from '@/middleware/auth'
import { resolveWorkspace } from '@/middleware/workspace'
import { ResponseUtil } from '@/utils/response'
import prisma from '@/lib/prisma'

const router = Router()

router.post('/events', authenticate, resolveWorkspace, async (req, res, next) => {
  try {
    const { scene, refType, refId, payload } = req.body
    await prisma.customerServiceEvent.create({
      data: {
        userId: req.user!.id,
        workspaceId: req.workspace?.id,
        scene,
        refType,
        refId,
        payload: payload ? JSON.stringify(payload) : null,
      },
    })
    ResponseUtil.success(res, null, 'ok')
  } catch (error) {
    next(error)
  }
})

export default router
