import { Sun, Moon, Download, Upload, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useThemeStore } from '@/stores/useThemeStore'
import { useBookStore } from '@/stores/useBookStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useState } from 'react'

export default function Settings() {
  const { isDark, toggleTheme } = useThemeStore()
  const { showToast } = useToast()
  const { books } = useBookStore()
  const { categories } = useCategoryStore()

  const [showClearModal, setShowClearModal] = useState(false)

  const exportData = () => {
    const data = {
      books,
      categories,
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booknest-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', '数据导出成功')
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string)
        if (data.books) {
          useBookStore.setState({ books: data.books })
        }
        if (data.categories) {
          useCategoryStore.setState({ categories: data.categories })
        }
        showToast('success', '数据导入成功')
      } catch {
        showToast('error', '导入失败，请检查文件格式')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const clearData = () => {
    useBookStore.setState({ books: [] })
    useCategoryStore.setState({ categories: [] })
    showToast('success', '所有数据已清除')
    setShowClearModal(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">设置</h1>

      {/* Theme */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">外观</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">切换亮色/暗色模式</p>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? '亮色模式' : '暗色模式'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">数据管理</h3>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4" />
              导出数据
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
              <input type="file" accept=".json" onChange={importData} className="hidden" />
              <Upload className="h-4 w-4" />
              导入数据
            </label>
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">清除所有数据</p>
                <p className="text-xs text-slate-500">此操作将删除所有书籍和分类，不可恢复</p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowClearModal(true)}>
                <Trash2 className="h-4 w-4" />
                清除
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white">关于</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            BookNest 个人藏书管理 — Day 1 前端基础
          </p>
          <p className="text-sm text-slate-400">
            数据存储在浏览器本地，Day 3 将接入后端 API
          </p>
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={clearData}
        title="清除所有数据"
        description="确定要删除所有书籍和分类吗？此操作不可恢复。"
        confirmText="确认清除"
      />
    </div>
  )
}
