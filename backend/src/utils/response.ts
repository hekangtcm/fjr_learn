import type { Response } from 'express'

export const ResponseUtil = {
  success<T>(res: Response, data: T, message = 'success', code = 200) {
    return res.status(code).json({ code, message, data })
  },

  paginated<T>(res: Response, items: T[], total: number, page: number, pageSize: number) {
    const totalPages = Math.ceil(total / pageSize)
    return res.status(200).json({
      code: 200,
      message: 'success',
      data: { items, total, page, pageSize, totalPages },
    })
  },

  error(res: Response, message: string, code = 400, details?: any) {
    return res.status(code).json({ code, message, details: details || undefined })
  },
}
