import { create } from 'zustand'
import apiClient from '@/lib/api-client'

export interface Workspace {
  id: string
  name: string
  description: string | null
  members: { role: string }[]
  _count: { members: number; books: number }
}

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  isLoading: boolean
  error: string | null
  fetchWorkspaces: () => Promise<void>
  setCurrentWorkspace: (workspace: Workspace) => void
  clearError: () => void
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await apiClient.get('/workspaces')
      const workspaces = res.data as Workspace[]
      const current = get().currentWorkspace
      // 如果当前 workspace 不在列表中，默认选第一个
      const found = current ? workspaces.find((w) => w.id === current.id) : null
      set({
        workspaces,
        currentWorkspace: found || workspaces[0] || null,
        isLoading: false,
      })
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || '获取工作区失败'
      set({ error: msg, isLoading: false })
    }
  },

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace })
  },

  clearError: () => set({ error: null }),
}))
