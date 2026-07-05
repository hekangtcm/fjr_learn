import { APIRequestContext } from '@playwright/test'

const API_BASE = process.env.E2E_API_URL || 'http://localhost:4000/api/v1'

export async function apiLogin(request: APIRequestContext, email: string, password: string) {
  const res = await request.post(`${API_BASE}/auth/login`, {
    data: { email, password },
  })
  const body = await res.json()
  return body.data.token as string
}

export async function apiGetWorkspaceId(request: APIRequestContext, token: string) {
  const res = await request.get(`${API_BASE}/workspaces`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const body = await res.json()
  return body.data[0].id as string
}
