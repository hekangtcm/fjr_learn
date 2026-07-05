import type { Request, Response } from 'express'
import { statsService } from '../services/stats.service'
import { ResponseUtil } from '../utils/response'

export async function getStats(req: Request, res: Response) {
  const stats = await statsService.getStats(req.workspace!.id)
  ResponseUtil.success(res, stats)
}
