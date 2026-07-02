import type { Request, Response } from 'express'
import { categoryService } from '../services/category.service'
import { ResponseUtil } from '../utils/response'

export class CategoryController {
  async list(req: Request, res: Response) {
    const categories = await categoryService.list(req.user!.id)
    ResponseUtil.success(res, categories)
  }

  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.user!.id, req.body)
    ResponseUtil.success(res, category, 'Category created', 201)
  }

  async update(req: Request, res: Response) {
    const category = await categoryService.update(req.user!.id, req.params.id as string, req.body)
    ResponseUtil.success(res, category)
  }

  async delete(req: Request, res: Response) {
    const result = await categoryService.delete(req.user!.id, req.params.id as string)
    ResponseUtil.success(res, result)
  }
}

export const categoryController = new CategoryController()
