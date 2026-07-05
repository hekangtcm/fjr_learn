import { test, expect } from '@playwright/test'
import { apiLogin } from './helpers/api'

const API_BASE = process.env.E2E_API_URL || 'http://localhost:4000/api/v1'

test('用户不能访问其他用户的书籍', async ({ request }) => {
  const tokenA = await apiLogin(request, 'e2e-a@booknest.com', 'password123')
  const tokenB = await apiLogin(request, 'e2e-b@booknest.com', 'password123')

  const createRes = await request.post(`${API_BASE}/books`, {
    headers: { Authorization: `Bearer ${tokenA}` },
    data: {
      title: `Private ${Date.now()}`,
      author: 'User A',
      status: 'OWNED',
    },
  })

  const created = await createRes.json()
  const bookId = created.data.id

  const res = await request.get(`${API_BASE}/books/${bookId}`, {
    headers: { Authorization: `Bearer ${tokenB}` },
  })

  expect([403, 404]).toContain(res.status())
})
