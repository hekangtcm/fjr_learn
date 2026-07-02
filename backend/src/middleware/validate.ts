import type { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { ResponseUtil } from '../utils/response'

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return ResponseUtil.error(res, 'Validation failed', 400, errors.array())
  }
  next()
}
