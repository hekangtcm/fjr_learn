import type { Request, Response } from 'express'
import { bookService } from '../services/book.service'
import { ResponseUtil } from '../utils/response'

export class BookController {
  async list(req: Request, res: Response) {
    const result = await bookService.list(req.user!.id, {
      page: Number(req.query.page) || 1,
      pageSize: Number(req.query.pageSize) || 10,
      status: req.query.status as any,
      categoryId: req.query.categoryId as string,
      sortBy: req.query.sortBy as string,
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    })
    ResponseUtil.paginated(res, result.items, result.total, result.page, result.pageSize)
  }

  async getById(req: Request, res: Response) {
    const book = await bookService.getById(req.user!.id, req.params.id as string)
    ResponseUtil.success(res, book)
  }

  async create(req: Request, res: Response) {
    const book = await bookService.create(req.user!.id, req.body)
    ResponseUtil.success(res, book, 'Book created', 201)
  }

  async update(req: Request, res: Response) {
    const book = await bookService.update(req.user!.id, req.params.id as string, req.body)
    ResponseUtil.success(res, book)
  }

  async delete(req: Request, res: Response) {
    const result = await bookService.delete(req.user!.id, req.params.id as string)
    ResponseUtil.success(res, result)
  }
}

export const bookController = new BookController()
