import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const bookStatusSchema = z.enum(['OWNED', 'READING', 'FINISHED', 'WISHLIST'])

export const bookSchema = z.object({
  id: z.string().uuid().openapi({ example: '4e8311a0-8f32-4e9d-a17b-0e9f12345678' }),
  title: z.string().openapi({ example: 'Clean Code' }),
  author: z.string().openapi({ example: 'Robert C. Martin' }),
  isbn: z.string().nullable().optional(),
  pageCount: z.number().nullable().optional(),
  description: z.string().nullable().optional(),
  coverUrl: z.string().nullable().optional(),
  status: bookStatusSchema,
  categoryId: z.string().uuid().nullable().optional(),
  userId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export const createBookBodySchema = z.object({
  title: z.string().min(1, '书名不能为空').max(200),
  author: z.string().min(1, '作者不能为空').max(100),
  isbn: z.string().max(13).optional(),
  pageCount: z.number().int().positive().optional(),
  description: z.string().max(2000).optional(),
  coverUrl: z.string().url().optional(),
  status: bookStatusSchema.default('WISHLIST'),
  categoryId: z.string().uuid().optional(),
})

export const updateBookBodySchema = createBookBodySchema.partial()

export const listBooksQuerySchema = z.object({
  page: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = Number(val)
      return !Number.isNaN(num) && num >= 1 && Number.isInteger(num)
    }, { message: 'Invalid page parameter, must be a positive integer' })
    .transform((val) => {
      if (!val) return 1
      return Number(val)
    })
    .pipe(z.number().int().positive().max(10000)),
  pageSize: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true
      const num = Number(val)
      return !Number.isNaN(num) && num >= 1 && num <= 100 && Number.isInteger(num)
    }, { message: 'Invalid pageSize parameter, must be an integer between 1 and 100' })
    .transform((val) => {
      if (!val) return 10
      return Number(val)
    })
    .pipe(z.number().int().positive().max(100)),
  status: bookStatusSchema.optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateBookBody = z.infer<typeof createBookBodySchema>
export type UpdateBookBody = z.infer<typeof updateBookBodySchema>
export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>
