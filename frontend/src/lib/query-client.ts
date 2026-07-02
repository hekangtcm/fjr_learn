import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 分钟内不重新请求
      gcTime: 30 * 60 * 1000,         // 30 分钟缓存
      retry: 2,                        // 失败重试 2 次
      refetchOnWindowFocus: false,     // 切回窗口不自动刷新
    },
  },
})
