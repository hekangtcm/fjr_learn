import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '@/middleware/auth'
import { resolveWorkspace } from '@/middleware/workspace'
import { ResponseUtil } from '@/utils/response'
import prisma from '@/lib/prisma'

const router = Router()

const recordSchema = z.object({
  templateId: z.string(),
  scene: z.string(),
  refType: z.string().optional(),
  refId: z.string().optional(),
  result: z.record(z.string(), z.string()),
})

router.post('/record', authenticate, resolveWorkspace, async (req, res, next) => {
  try {
    const input = recordSchema.parse(req.body)
    const status = input.result[input.templateId]?.toUpperCase() || 'UNKNOWN'

    await prisma.subscriptionRecord.create({
      data: {
        userId: req.user!.id,
        workspaceId: req.workspace?.id,
        templateId: input.templateId,
        scene: input.scene,
        status,
        rawResult: JSON.stringify(input.result),
      },
    })

    ResponseUtil.success(res, { status })
  } catch (error) {
    next(error)
  }
})

export default router
