import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/useAuthStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useEffect, useState } from 'react'
import AppRoutes from './routes'

function App() {
  const [isReady, setIsReady] = useState(false)

  // 初始化时从 localStorage 加载 token，并获取工作区列表
  useEffect(() => {
    const init = async () => {
      const authStore = useAuthStore.getState()
      authStore.loadFromStorage()
      // 如果已认证，等待工作区列表加载完成
      if (authStore.isAuthenticated) {
        await useWorkspaceStore.getState().fetchWorkspaces()
      }
      setIsReady(true)
    }
    init()
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
