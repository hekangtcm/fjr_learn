import { useQuery } from '@tanstack/react-query'
import { listBooks, type ListBooksParams } from '@/services/books'

export const bookKeys = {
  all: ['books'] as const,
  list: (workspaceId: string | null, params: ListBooksParams) =>
    ['books', 'list', workspaceId, params] as const,
}

export function useBooks(workspaceId: string | null, params: ListBooksParams) {
  return useQuery({
    queryKey: bookKeys.list(workspaceId, params),
    queryFn: () => listBooks(params),
    enabled: Boolean(workspaceId),
  })
}
