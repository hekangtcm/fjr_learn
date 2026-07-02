import prisma from '../lib/prisma'
import { ApiError } from '../utils/errors'

export class CategoryService {
  async list(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      include: { _count: { select: { books: true } } },
    })
  }

  async create(userId: string, data: { name: string; color: string }) {
    try {
      return await prisma.category.create({
        data: { ...data, userId },
      })
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ApiError(409, 'Category name already exists')
      }
      throw err
    }
  }

  async update(userId: string, categoryId: string, data: { name?: string; color?: string }) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category || category.userId !== userId) {
      throw new ApiError(403, 'You can only update your own categories')
    }
    return prisma.category.update({ where: { id: categoryId }, data })
  }

  async delete(userId: string, categoryId: string) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category || category.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own categories')
    }
    await prisma.category.delete({ where: { id: categoryId } })
    return { id: categoryId }
  }
}

export const categoryService = new CategoryService()
