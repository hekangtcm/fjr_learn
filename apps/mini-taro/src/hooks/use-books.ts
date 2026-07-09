import { useInfiniteQuery } from '@tanstack/react-query'
import { listBooks, type ListBooksParams } from '@/services/books'

export const bookKeys = {
  all: ['books'] as const,
  list: (workspaceId: string | null, params: ListBooksParams) =>
    ['books', 'list', workspaceId, params] as const,
}

export function useBooks(workspaceId: string | null, params: Omit<ListBooksParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: bookKeys.list(workspaceId, params),
    queryFn: ({ pageParam = 1 }) =>
      listBooks({ ...params, page: pageParam, pageSize: 10 }),
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined
    },
    initialPageParam: 1,
    enabled: Boolean(workspaceId),
  })
}
