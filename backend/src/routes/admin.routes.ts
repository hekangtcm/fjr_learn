import { Router } from 'express'
import { authenticate } from '@/middleware/auth'
import { resolveWorkspace } from '@/middleware/workspace'
import { requireWorkspaceRole } from '@/middleware/workspace'
import { ResponseUtil } from '@/utils/response'
import { ApiError } from '@/utils/errors'
import prisma from '@/lib/prisma'
import { checkTextSecurity } from '@/services/content-security/text-security.service'

const router = Router()

// 文本安全检测
router.post('/check-text', authenticate, resolveWorkspace, async (req, res, next) => {
  try {
    const { content, targetType, targetId } = req.body
    if (!content || !targetType) {
      throw new ApiError(400, '缺少 content 或 targetType')
    }

    const result = await checkTextSecurity({
      content,
      userId: req.user!.id,
      workspaceId: req.workspace!.id,
      targetType,
      targetId,
    })

    ResponseUtil.success(res, result)
  } catch (error) {
    next(error)
  }
})

// 管理员：查看风险内容列表
router.get('/checks', authenticate, resolveWorkspace, requireWorkspaceRole('ADMIN'), async (req, res, next) => {
  try {
    const status = req.query.status as string || 'REVIEW'
    const checks = await prisma.contentSecurityCheck.findMany({
      where: {
        workspaceId: req.workspace!.id,
        status,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    ResponseUtil.success(res, checks)
  } catch (error) {
    next(error)
  }
})

// 管理员：通过
router.post('/checks/:id/approve', authenticate, resolveWorkspace, requireWorkspaceRole('ADMIN'), async (req, res, next) => {
  try {
    const check = await prisma.contentSecurityCheck.update({
      where: { id: req.params.id as string },
      data: { status: 'PASS' },
    })
    ResponseUtil.success(res, check)
  } catch (error) {
    next(error)
  }
})

// 管理员：驳回
router.post('/checks/:id/reject', authenticate, resolveWorkspace, requireWorkspaceRole('ADMIN'), async (req, res, next) => {
  try {
    const check = await prisma.contentSecurityCheck.update({
      where: { id: req.params.id as string },
      data: { status: 'REJECT' },
    })
    ResponseUtil.success(res, check)
  } catch (error) {
    next(error)
  }
})

export default router
