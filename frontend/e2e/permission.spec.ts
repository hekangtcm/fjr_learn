import { test, expect } from '@playwright/test'
import { apiLogin, apiGetWorkspaceId } from './helpers/api'

const API_BASE = process.env.E2E_API_URL || 'http://localhost:4000/api/v1'

test('用户不能访问其他用户的书籍', async ({ request }) => {
  const tokenA = await apiLogin(request, 'e2e-a@booknest.com', 'password123')
  const tokenB = await apiLogin(request, 'e2e-b@booknest.com', 'password123')

  const workspaceIdA = await apiGetWorkspaceId(request, tokenA)
  const workspaceIdB = await apiGetWorkspaceId(request, tokenB)

  const createRes = await request.post(`${API_BASE}/books`, {
    headers: {
      Authorization: `Bearer ${tokenA}`,
      'X-Workspace-Id': workspaceIdA,
    },
    data: {
      title: `Private ${Date.now()}`,
      author: 'User A',
      status: 'OWNED',
    },
  })

  const created = await createRes.json()
  const bookId = created.data.id

  // 用户 B 用 workspace A 的 ID 访问应该 404（因为书不在 B 的工作区）
  const res = await request.get(`${API_BASE}/books/${bookId}`, {
    headers: {
      Authorization: `Bearer ${tokenB}`,
      'X-Workspace-Id': workspaceIdA,
    },
  })

  expect([403, 404]).toContain(res.status())

  // 用户 B 用自己 workspace ID 访问也应该 404（因为书不在 B 的工作区）
  const res2 = await request.get(`${API_BASE}/books/${bookId}`, {
    headers: {
      Authorization: `Bearer ${tokenB}`,
      'X-Workspace-Id': workspaceIdB,
    },
  })

  expect(res2.status()).toBe(404)
})
