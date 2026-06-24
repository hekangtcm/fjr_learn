import { Link, Outlet, useLocation } from 'react-router-dom'
import { BookOpen, LayoutGrid, Tag, BarChart3, Settings, Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/stores/useThemeStore'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: '书籍', icon: BookOpen },
  { path: '/categories', label: '分类', icon: Tag },
  { path: '/stats', label: '统计', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
]

export default function Layout() {
  const location = useLocation()
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">BookNest</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
            title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="flex border-b border-slate-200 bg-white md:hidden dark:border-slate-700 dark:bg-slate-800">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium',
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-500 dark:text-slate-400'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        BookNest — 个人藏书管理
      </footer>
    </div>
  )
}
