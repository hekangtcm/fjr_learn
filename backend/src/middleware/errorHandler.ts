import { Request, Response, NextFunction } from 'express'
import logger from '@/lib/logger'
import { ApiError } from '@/utils/errors'

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  // 已知的业务错误
  if (err instanceof ApiError) {
    logger.warn('Business error', {
      statusCode: err.statusCode,
      message: err.message,
      path: req.path,
      method: req.method,
      userId: (req as any).user?.id,
    })

    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      ...(err.details && { details: err.details }),
    })
  }

  // CORS 错误（由 cors 中间件抛出）
  if (err.message?.includes('CORS') || err.message?.includes('Not allowed by CORS')) {
    logger.warn('CORS blocked', { origin: (req as any).headers?.origin, path: req.path })
    return res.status(403).json({
      code: 403,
      message: '请求来源不被允许',
    })
  }
  if (err.name === 'MulterError') {
    logger.warn('File upload error', { error: err.message, path: req.path })
    return res.status(400).json({
      code: 400,
      message: '文件上传失败: ' + err.message,
    })
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    logger.warn('JWT error', { error: err.message, path: req.path, method: req.method })
    return res.status(401).json({
      code: 401,
      message: '认证失败: ' + err.message,
    })
  }

  // 未知错误 — 需要告警
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    userId: (req as any).user?.id,
  })

  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}
