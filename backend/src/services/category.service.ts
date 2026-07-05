import prisma from '../lib/prisma'
import { ApiError } from '../utils/errors'
import { writeAuditLog } from './audit.service'

export class CategoryService {
  async list(workspaceId: string) {
    return prisma.category.findMany({
      where: { workspaceId },
      include: { _count: { select: { books: true } } },
    })
  }

  async create(userId: string, workspaceId: string, role: string, data: { name: string; color: string }) {
    if (role === 'VIEWER') {
      throw new ApiError(403, 'Viewer cannot create categories')
    }
    try {
      const category = await prisma.category.create({
        data: { ...data, userId, workspaceId },
      })
      await writeAuditLog({
        workspaceId,
        actorId: userId,
        action: 'CATEGORY_CREATE',
        entityType: 'Category',
        entityId: category.id,
        metadata: { name: data.name },
      })
      return category
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ApiError(409, 'Category name already exists in this workspace')
      }
      throw err
    }
  }

  async update(userId: string, workspaceId: string, role: string, categoryId: string, data: { name?: string; color?: string }) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, workspaceId } })
    if (!category) {
      throw new ApiError(404, 'Category not found')
    }
    const canEdit = ['OWNER', 'ADMIN'].includes(role) || (role === 'MEMBER' && category.userId === userId)
    if (!canEdit) {
      throw new ApiError(403, 'You do not have permission to update this category')
    }
    const updated = await prisma.category.update({ where: { id: categoryId }, data })
    await writeAuditLog({
      workspaceId,
      actorId: userId,
      action: 'CATEGORY_UPDATE',
      entityType: 'Category',
      entityId: categoryId,
      metadata: data,
    })
    return updated
  }

  async delete(userId: string, workspaceId: string, role: string, categoryId: string) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, workspaceId } })
    if (!category) {
      throw new ApiError(404, 'Category not found')
    }
    const canDelete = ['OWNER', 'ADMIN'].includes(role) || (role === 'MEMBER' && category.userId === userId)
    if (!canDelete) {
      throw new ApiError(403, 'You do not have permission to delete this category')
    }
    await prisma.category.delete({ where: { id: categoryId } })
    await writeAuditLog({
      workspaceId,
      actorId: userId,
      action: 'CATEGORY_DELETE',
      entityType: 'Category',
      entityId: categoryId,
      metadata: { name: category.name },
    })
    return { id: categoryId }
  }
}

export const categoryService = new CategoryService()
