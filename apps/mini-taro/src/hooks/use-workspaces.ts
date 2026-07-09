import { useQuery } from '@tanstack/react-query'
import { listWorkspaces } from '@/services/workspaces'

export const workspaceKeys = {
  all: ['workspaces'] as const,
}

export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: listWorkspaces,
  })
}
