import { useQuery } from '@tanstack/react-query'
import { getBook } from '@/services/books'

export const bookKeys = {
  detail: (id: string) => ['books', 'detail', id] as const,
}

export function useBookDetail(id: string) {
  return useQuery({
    queryKey: bookKeys.detail(id),
    queryFn: () => getBook(id),
    enabled: Boolean(id),
  })
}
