import { describe, it, expect } from 'vitest'
import { z } from 'zod'

const bookSchema = z.object({
  title: z.string().min(1, '书名不能为空').max(200, '书名不超过200字'),
  author: z.string().min(1, '作者不能为空').max(100, '作者不超过100字'),
  isbn: z.string().regex(/^(?:\d{10}|\d{13})$/, 'ISBN格式不正确').optional().or(z.literal('')),
  pageCount: z.number().positive('页数必须大于0').optional(),
  description: z.string().max(2000, '描述不超过2000字').optional(),
  status: z.enum(['OWNED', 'READING', 'FINISHED', 'WISHLIST']),
  categoryId: z.string().optional().or(z.literal('')),
})

describe('bookSchema validation', () => {
  it('should accept valid book data', () => {
    const result = bookSchema.safeParse({
      title: 'Effective TypeScript',
      author: 'Dan Vanderkam',
      status: 'OWNED',
      pageCount: 400,
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const result = bookSchema.safeParse({
      title: '',
      author: 'Dan',
      status: 'WISHLIST',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('书名不能为空')
    }
  })

  it('should reject invalid ISBN', () => {
    const result = bookSchema.safeParse({
      title: 'Test Book',
      author: 'Test',
      status: 'OWNED',
      isbn: 'invalid',
    })
    expect(result.success).toBe(false)
  })
})
