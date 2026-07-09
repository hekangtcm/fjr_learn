import type { WorkspaceRole } from '@booknest/domain'

const rank: Record<WorkspaceRole, number> = {
  VIEWER: 1,
  MEMBER: 2,
  ADMIN: 3,
  OWNER: 4,
}

export function canCreateBook(role?: WorkspaceRole | null) {
  return Boolean(role && rank[role] >= rank.MEMBER)
}

export function canEditBook(role?: WorkspaceRole | null) {
  return Boolean(role && rank[role] >= rank.MEMBER)
}

export function canDeleteBook(role?: WorkspaceRole | null) {
  return Boolean(role && rank[role] >= rank.ADMIN)
}

export function canDeleteOwnBook(role?: WorkspaceRole | null, isOwner?: boolean) {
  if (!role) return false
  if (rank[role] >= rank.ADMIN) return true
  if (role === 'MEMBER' && isOwner) return true
  return false
}

export function canManageMembers(role?: WorkspaceRole | null) {
  return role === 'OWNER' || role === 'ADMIN'
}
