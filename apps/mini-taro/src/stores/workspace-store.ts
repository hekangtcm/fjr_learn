import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Workspace } from '@booknest/domain'

interface WorkspaceState {
  workspaces: Workspace[]
  activeWorkspaceId: string | null
  setWorkspaces: (workspaces: Workspace[]) => void
  setActiveWorkspaceId: (id: string) => void
  hydrate: () => void
}

const ACTIVE_WS_KEY = 'booknest_workspace_id'

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: [],
  activeWorkspaceId: null,
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspaceId: (id) => {
    Taro.setStorageSync(ACTIVE_WS_KEY, id)
    set({ activeWorkspaceId: id })
  },
  hydrate: () => {
    const id = Taro.getStorageSync<string>(ACTIVE_WS_KEY) || null
    set({ activeWorkspaceId: id })
  },
}))
