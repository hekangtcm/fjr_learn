import prisma from '../lib/prisma'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { ApiError } from '../utils/errors'

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ApiError(409, 'Email already exists')
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: { email, passwordHash, name },
      })

      await tx.workspace.create({
        data: {
          name: `${name} 的个人书架`,
          description: '默认 Workspace',
          members: {
            create: {
              userId: createdUser.id,
              role: 'OWNER',
            },
          },
        },
      })

      return createdUser
    })

    return { id: user.id, email: user.email, name: user.name, role: user.role }
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      throw new ApiError(401, 'Invalid email or password')
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      throw new ApiError(401, 'Invalid email or password')
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    )

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    if (!user) {
      throw new ApiError(404, 'User not found')
    }
    return user
  }
}

export const authService = new AuthService()
