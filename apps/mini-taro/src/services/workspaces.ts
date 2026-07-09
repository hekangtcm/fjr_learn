import { request } from './request'
import type { Workspace } from '@booknest/domain'

export function listWorkspaces() {
  return request<Workspace[]>({ url: '/workspaces' })
}
