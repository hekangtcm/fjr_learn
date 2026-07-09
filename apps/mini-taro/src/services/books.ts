import { request } from './request'
import type { Book } from '@booknest/domain'

export interface ListBooksParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
  categoryId?: string
}

export interface PageResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export function listBooks(params: ListBooksParams) {
  return request<PageResult<Book>>({
    url: '/books',
    method: 'GET',
    data: params,
  })
}
