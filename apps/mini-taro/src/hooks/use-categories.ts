import { useQuery } from '@tanstack/react-query'
import { listCategories } from '@/services/categories'

export const categoryKeys = {
  all: ['categories'] as const,
}

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: listCategories,
  })
}
