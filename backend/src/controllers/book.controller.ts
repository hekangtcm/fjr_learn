import type { Request, Response } from 'express'
import { bookService } from '../services/book.service'
import { ResponseUtil } from '../utils/response'

export class BookController {
  async list(req: Request, res: Response) {
    const query = (req as any).validatedQuery || req.query
    const workspaceId = req.workspace?.id
    if (!workspaceId) {
      return ResponseUtil.success(res, { items: [], total: 0, page: 1, pageSize: 10 })
    }
    const result = await bookService.list(workspaceId, {
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 10,
      status: query.status as any,
      categoryId: query.categoryId as string,
      sortBy: query.sortBy as string,
      sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    })
    ResponseUtil.paginated(res, result.items, result.total, result.page, result.pageSize)
  }

  async getById(req: Request, res: Response) {
    const workspaceId = req.workspace?.id
    if (!workspaceId) {
      return res.status(400).json({ code: 400, message: '缺少 Workspace' })
    }
    const book = await bookService.getById(workspaceId, req.params.id as string)
    ResponseUtil.success(res, book)
  }

  async create(req: Request, res: Response) {
    const book = await bookService.create(req.user!.id, req.workspace!.id, req.body)
    ResponseUtil.success(res, book, 'Book created', 201)
  }

  async update(req: Request, res: Response) {
    const book = await bookService.update(req.user!.id, req.workspace!.id, req.workspace!.role, req.params.id as string, req.body)
    ResponseUtil.success(res, book)
  }

  async delete(req: Request, res: Response) {
    const result = await bookService.delete(req.user!.id, req.workspace!.id, req.workspace!.role, req.params.id as string)
    ResponseUtil.success(res, result)
  }
}

export const bookController = new BookController()
