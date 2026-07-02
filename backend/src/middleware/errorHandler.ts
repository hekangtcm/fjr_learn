import type { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/errors'

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      details: err.details,
    })
  }

  console.error('Unhandled error:', err)
  return res.status(500).json({
    code: 500,
    message: 'Internal server error',
  })
}
