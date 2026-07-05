import crypto from 'crypto'
import prisma from '@/lib/prisma'
import { ApiError } from '@/utils/errors'
import { writeAuditLog } from './audit.service'

export async function listWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        where: { userId },
        select: { role: true },
      },
      _count: {
        select: { members: true, books: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createWorkspace(userId: string, data: { name: string; description?: string }) {
  const workspace = await prisma.workspace.create({
    data: {
      name: data.name,
      description: data.description,
      members: {
        create: {
          userId,
          role: 'OWNER',
        },
      },
    },
  })

  await writeAuditLog({
    workspaceId: workspace.id,
    actorId: userId,
    action: 'workspace.created',
    entityType: 'Workspace',
    entityId: workspace.id,
    metadata: { name: workspace.name },
  })

  return workspace
}

export async function listMembers(workspaceId: string) {
  return prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: { id: true, email: true, name: true, createdAt: true },
      },
    },
    orderBy: { joinedAt: 'asc' },
  })
}

export async function inviteMember(
  workspaceId: string,
  actorId: string,
  data: { email: string; role: string },
) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      invitedById: actorId,
      email: data.email,
      role: data.role,
      token,
      expiresAt,
    },
  })

  await writeAuditLog({
    workspaceId,
    actorId,
    action: 'member.invited',
    entityType: 'Invitation',
    entityId: invitation.id,
    metadata: { email: data.email, role: data.role },
  })

  return invitation
}

export async function acceptInvitation(userId: string, token: string) {
  const invitation = await prisma.invitation.findUnique({ where: { token } })

  if (!invitation) throw new ApiError(404, '邀请不存在')
  if (invitation.status !== 'PENDING') throw new ApiError(400, '邀请不可用')
  if (invitation.expiresAt < new Date()) throw new ApiError(400, '邀请已过期')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new ApiError(404, '用户不存在')
  if (user.email !== invitation.email) throw new ApiError(403, '该邀请不属于当前用户')

  return prisma.$transaction(async (tx) => {
    const member = await tx.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId,
        },
      },
      update: { role: invitation.role },
      create: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
      },
    })

    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    })

    await tx.auditLog.create({
      data: {
        workspaceId: invitation.workspaceId,
        actorId: userId,
        action: 'member.joined',
        entityType: 'WorkspaceMember',
        entityId: member.id,
        metadata: JSON.stringify({ invitationId: invitation.id }),
      },
    })

    return member
  })
}

export async function updateMemberRole(
  workspaceId: string,
  actorId: string,
  memberId: string,
  role: string,
) {
  const member = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId },
  })

  if (!member) throw new ApiError(404, '成员不存在')
  if (member.role === 'OWNER') throw new ApiError(400, '不能直接修改 OWNER 角色')

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role },
  })

  await writeAuditLog({
    workspaceId,
    actorId,
    action: 'member.role_updated',
    entityType: 'WorkspaceMember',
    entityId: memberId,
    metadata: { from: member.role, to: role },
  })

  return updated
}
