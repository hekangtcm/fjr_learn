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

  async me(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.id)
    ResponseUtil.success(res, user)
  }
}

export const authController = new AuthController()
