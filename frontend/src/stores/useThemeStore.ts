import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

function getInitialDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyDark(isDark: boolean) {
  if (typeof document === 'undefined') return
  if (isDark) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDark: getInitialDark(),
      toggleTheme: () =>
        set((state) => {
          const isDark = !state.isDark
          applyDark(isDark)
          return { isDark }
        }),
      setTheme: (isDark) => {
        applyDark(isDark)
        set({ isDark })
      },
    }),
    {
      name: 'booknest-theme',
      onRehydrateStorage: () => (state) => {
        applyDark(state?.isDark ?? false)
      },
    }
  )
)
