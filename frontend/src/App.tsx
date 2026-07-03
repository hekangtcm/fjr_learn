import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider } from '@/components/ui/Toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/useAuthStore'
import { useEffect } from 'react'
import AppRoutes from './routes'

function App() {
  // 初始化时从 localStorage 加载 token
  useEffect(() => {
    useAuthStore.getState().loadFromStorage()
  }, [])

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
