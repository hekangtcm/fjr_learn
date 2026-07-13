import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/errors'

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string }
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  // 安全：CORS 预检请求不携带认证头，直接放行
  if (req.method === 'OPTIONS') {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError(401, '未提供认证令牌')
  }

  const token = authHeader.slice(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role }
    next()
  } catch {
    throw new ApiError(401, '无效的认证令牌')
  }
}
