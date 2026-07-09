import crypto from 'node:crypto'
import prisma from '@/lib/prisma'

export async function checkTextSecurity(input: {
  content: string
  userId: string
  workspaceId?: string
  targetType: string
  targetId?: string
  openid?: string
}) {
  const contentHash = crypto.createHash('sha256').update(input.content).digest('hex')

  if (process.env.CONTENT_SECURITY_MODE === 'mock') {
    const risky = /敏感|违法|spam/i.test(input.content)
    return saveCheck(input, contentHash, risky ? 'REJECT' : 'PASS', JSON.stringify({ mock: true }))
  }

  // real mode: 学习阶段简化实现
  const risky = /敏感|违法|spam/i.test(input.content)
  return saveCheck(input, contentHash, risky ? 'REJECT' : 'PASS', JSON.stringify({ mock: true, reason: 'learning-stage' }))
}

export async function saveCheck(
  input: {
    content: string
    userId: string
    workspaceId?: string
    targetType: string
    targetId?: string
  },
  contentHash: string,
  status: string,
  rawResult: string
) {
  return prisma.contentSecurityCheck.create({
    data: {
      userId: input.userId,
      workspaceId: input.workspaceId,
      targetType: input.targetType,
      targetId: input.targetId,
      contentType: 'TEXT',
      contentHash,
      status,
      rawResult,
    },
  })
}
