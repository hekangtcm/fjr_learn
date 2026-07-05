import type { Request, Response, NextFunction } from 'express'
import { ResponseUtil } from '../utils/response'
import * as importService from '../services/import.service'

export async function createBookImport(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请上传 CSV 文件' })
    }
    const job = await importService.createBookImportJob(req.user!.id, req.workspace!.id, req.file as Express.Multer.File)
    ResponseUtil.success(res, job, '导入任务已创建', 201)
  } catch (err) {
    next(err)
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await importService.getImportJob(req.user!.id, req.workspace!.id, req.params.jobId as string)
    if (!job) {
      return res.status(404).json({ code: 404, message: '任务不存在' })
    }
    ResponseUtil.success(res, job)
  } catch (err) {
    next(err)
  }
}
