import type { Request, Response } from 'express'
import { reviewService } from '../services/review.service'
import { ResponseUtil } from '../utils/response'

export class ReviewController {
  async listByBook(req: Request, res: Response) {
    const reviews = await reviewService.listByBook(req.workspace!.id, req.params.bookId as string)
    ResponseUtil.success(res, reviews)
  }

  async create(req: Request, res: Response) {
    const review = await reviewService.create(req.workspace!.id, req.user!.id, req.params.bookId as string, req.body)
    ResponseUtil.success(res, review, 'Review created', 201)
  }
}

export const reviewController = new ReviewController()
