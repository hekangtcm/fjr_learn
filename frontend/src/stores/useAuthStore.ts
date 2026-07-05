import { create } from 'zustand'
import apiClient from '@/lib/api-client'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'

export interface User {
  id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  loadFromStorage: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const res = await apiClient.post('/auth/login', { email, password })
      const { token, user } = res.data as { token: string; user: User }
      localStorage.setItem('auth_token', token)
      set({ token, user, isAuthenticated: true, isLoading: false })
      // 登录后获取工作区列表
      await useWorkspaceStore.getState().fetchWorkspaces()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '登录失败'
      set({ error: msg, isLoading: false, isAuthenticated: false })
      throw new Error(msg)
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null })
    try {
      const res = await apiClient.post('/auth/register', { email, password, name })
      const { token, user } = res.data as { token: string; user: User }
      localStorage.setItem('auth_token', token)
      set({ token, user, isAuthenticated: true, isLoading: false })
      // 注册后获取工作区列表
      await useWorkspaceStore.getState().fetchWorkspaces()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '注册失败'
      set({ error: msg, isLoading: false, isAuthenticated: false })
      throw new Error(msg)
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token')
    useWorkspaceStore.getState().setCurrentWorkspace(null as any)
    set({ token: null, user: null, isAuthenticated: false, error: null })
  },

  loadFromStorage: () => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      // 简单验证：如果有 token 就标记为已认证，后续请求会验证
      set({ token, isAuthenticated: true })
      // 恢复时异步获取工作区列表
      useWorkspaceStore.getState().fetchWorkspaces().catch(() => {})
    }
  },

  clearError: () => set({ error: null }),
}))
