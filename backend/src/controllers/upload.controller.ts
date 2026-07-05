import { Request, Response, NextFunction } from 'express'
import prisma from '../lib/prisma'
import { ApiError } from '../utils/errors'
import { cache } from '../lib/cache'
import { notifyUser } from '../lib/socket'
import fs from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

export async function uploadCover(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择文件' })
    }

    const userId = req.user!.id
    const workspaceId = req.workspace!.id
    const role = req.workspace!.role
    const bookId = req.params.id as string

    const book = await prisma.book.findFirst({ where: { id: bookId, workspaceId } })
    if (!book) {
      throw new ApiError(404, '书籍不存在')
    }

    const canEdit = ['OWNER', 'ADMIN'].includes(role) || (role === 'MEMBER' && book.userId === userId)
    if (!canEdit) {
      throw new ApiError(403, '无权编辑该书籍')
    }

    // 保存到本地 uploads 目录
    const filename = `${Date.now()}-${req.file.originalname}`
    const filepath = path.join(UPLOAD_DIR, filename)
    fs.writeFileSync(filepath, req.file.buffer)

    const coverUrl = `/uploads/${filename}`

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: { coverUrl },
      include: { category: true },
    })

    // 清除缓存
    await cache.del(`stats:${workspaceId}`)
    await cache.del(`books:${workspaceId}:*`)

    notifyUser(userId, 'book:coverUpdated', {
      message: `《${updated.title}》封面已更新`,
      book: updated,
    })

    res.json({ code: 200, message: '封面上传成功', data: updated })
  } catch (err) {
    next(err)
  }
}

// 提供本地文件访问
export function serveUploads(req: Request, res: Response, next: NextFunction) {
  const filename = req.params.filename as string
  const filepath = path.join(UPLOAD_DIR, filename)

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ code: 404, message: '文件不存在' })
  }

  res.sendFile(filepath)
}
