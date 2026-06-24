import { useState } from 'react'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmModal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import { useCategoryStore } from '@/stores/useCategoryStore'

export default function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const presetColors = [
    '#3B82F6', '#22C55E', '#A855F7', '#F59E0B', '#EF4444',
    '#06B6D4', '#EC4899', '#6366F1', '#14B8A6', '#F97316',
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingId) {
      updateCategory(editingId, { name: name.trim(), color })
      showToast('success', '分类更新成功')
      setEditingId(null)
    } else {
      addCategory({ name: name.trim(), color })
      showToast('success', '分类创建成功')
    }
    setName('')
    setColor('#3B82F6')
  }

  const startEdit = (cat: typeof categories[0]) => {
    setEditingId(cat.id)
    setName(cat.name)
    setColor(cat.color)
  }

  const handleDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId)
      showToast('success', '分类已删除')
      setDeleteId(null)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">分类管理</h1>

      {/* Add/Edit Form */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  label={editingId ? '编辑分类' : '新建分类'}
                  placeholder="分类名称"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="sm:w-48">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  颜色
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 rounded-lg border border-slate-300 cursor-pointer dark:border-slate-600"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">{color}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-6 w-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                  style={{ backgroundColor: c, borderColor: color === c ? c : 'white' }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4" />
                {editingId ? '更新' : '添加'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={() => { setEditingId(null); setName(''); setColor('#3B82F6') }}>
                  取消
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Category List */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map((cat) => (
          <Card key={cat.id} className="group">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  <Tag className="h-4 w-4" style={{ color: cat.color }} />
                </div>
                <span className="font-medium text-slate-900 dark:text-white">{cat.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(cat)}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteId(cat.id)}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          还没有分类，添加一个吧
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="删除分类"
        description="确定要删除这个分类吗？关联的书籍将变为未分类。"
        confirmText="删除"
      />
    </div>
  )
}
