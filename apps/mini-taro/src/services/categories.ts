import { request } from './request'
import type { Category } from '@booknest/domain'

export function listCategories() {
  return request<Category[]>({ url: '/categories' })
}
