import type { Request, Response } from 'express'
import { authService } from '../services/auth.service'
import { ResponseUtil } from '../utils/response'

export class AuthController {
  async register(req: Request, res: Response) {
    const { email, password, name } = req.body
    const user = await authService.register(email, password, name)
    ResponseUtil.success(res, user, 'User registered successfully', 201)
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    ResponseUtil.success(res, result)
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return ResponseUtil.error(res, '缺少 refreshToken', 400)
    }
    const result = await authService.refresh(refreshToken)
    ResponseUtil.success(res, result)
  }

  async logout(req: Request, res: Response) {
    ResponseUtil.success(res, { message: '已退出登录' })
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body
    if (!email) {
      return ResponseUtil.error(res, '缺少 email', 400)
    }
    ResponseUtil.success(res, { message: '如果邮箱存在，重置链接已发送' })
  }

  async me(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.id)
    ResponseUtil.success(res, user)
  }
}

export const authController = new AuthController()
