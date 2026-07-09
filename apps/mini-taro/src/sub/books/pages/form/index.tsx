import { useState, useEffect } from 'react'
import { Button, Image, Input, Picker, ScrollView, Text, Textarea, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useBookDetail } from '@/hooks/use-book-detail'
import { useCategories } from '@/hooks/use-categories'
import { createBook, updateBook } from '@/services/books'
import { chooseCoverImage, uploadCover } from '@/services/upload'
import { useWorkspaceStore } from '@/stores/workspace-store'
import './index.scss'

interface FormState {
  title: string
  author: string
  description: string
  status: string
  categoryId: string
  isbn: string
  pageCount: string
  publishedDate: string
}

const STATUS_OPTIONS = [
  { label: '已拥有', value: 'OWNED' },
  { label: '阅读中', value: 'READING' },
  { label: '已读完', value: 'FINISHED' },
  { label: '想读', value: 'WISHLIST' },
]

const EMPTY_FORM: FormState = {
  title: '',
  author: '',
  description: '',
  status: 'OWNED',
  categoryId: '',
  isbn: '',
  pageCount: '',
  publishedDate: '',
}

function validateForm(form: FormState): string | null {
  if (!form.title.trim()) return '请输入书名'
  if (!form.author.trim()) return '请输入作者'
  if (form.pageCount && Number(form.pageCount) < 0) return '页数不能为负数'
  return null
}

export default function BookFormPage() {
  const router = useRouter()
  const id = router.params.id
  const isEdit = Boolean(id)
  const { activeWorkspaceId } = useWorkspaceStore()

  const { data: book } = useBookDetail(id || '')
  const { data: categories = [] } = useCategories()

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [tempCoverPath, setTempCoverPath] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isEdit && book) {
      setForm({
        title: book.title || '',
        author: book.author || '',
        description: book.description || '',
        status: book.status || 'OWNED',
        categoryId: book.categoryId || '',
        isbn: book.isbn || '',
        pageCount: book.pageCount?.toString() || '',
        publishedDate: book.publishedDate || '',
      })
    }
  }, [isEdit, book])

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleStatusChange = (e: any) => {
    setForm((prev) => ({ ...prev, status: STATUS_OPTIONS[e.detail.value].value }))
  }

  const handleCategoryChange = (e: any) => {
    const idx = e.detail.value
    setForm((prev) => ({
      ...prev,
      categoryId: idx === 0 ? '' : categories[idx - 1].id,
    }))
  }

  const handleChooseCover = async () => {
    try {
      const path = await chooseCoverImage()
      setTempCoverPath(path)
    } catch (e: any) {
      Taro.showToast({ title: e.message || '选择图片失败', icon: 'none' })
    }
  }

  const handleSubmit = async () => {
    const error = validateForm(form)
    if (error) {
      Taro.showToast({ title: error, icon: 'none' })
      return
    }
    if (!activeWorkspaceId) {
      Taro.showToast({ title: '请先选择书架', icon: 'none' })
      return
    }
    if (submitting) return

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        description: form.description.trim() || undefined,
        status: form.status,
        categoryId: form.categoryId || undefined,
        isbn: form.isbn.trim() || undefined,
        pageCount: form.pageCount ? Number(form.pageCount) : undefined,
        publishedDate: form.publishedDate || undefined,
      }

      const saved = isEdit
        ? await updateBook(id!, payload)
        : await createBook(payload)

      if (tempCoverPath && saved.id) {
        try {
          await uploadCover(saved.id, tempCoverPath)
        } catch (e: any) {
          Taro.showToast({ title: '封面上传失败：' + e.message, icon: 'none' })
        }
      }

      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        Taro.redirectTo({ url: `/sub/books/pages/detail/index?id=${saved.id}` })
      }, 800)
    } catch (e: any) {
      Taro.showToast({ title: e.message || '保存失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  const categoryRange = ['不选择', ...categories.map((c) => c.name)]
  const statusIndex = STATUS_OPTIONS.findIndex((s) => s.value === form.status)
  const categoryIndex = form.categoryId
    ? categories.findIndex((c) => c.id === form.categoryId) + 1
    : 0

  return (
    <View className="page form-page">
      <ScrollView scrollY className="form-scroll">
        <View className="form-group">
          <Text className="form-group__label">封面</Text>
          <View className="cover-uploader" onClick={handleChooseCover}>
            {tempCoverPath ? (
              <Image className="cover-uploader__img" src={tempCoverPath} mode="aspectFill" />
            ) : book?.coverUrl ? (
              <Image className="cover-uploader__img" src={book.coverUrl} mode="aspectFill" />
            ) : (
              <Text className="cover-uploader__placeholder">+ 选择封面</Text>
            )}
          </View>
        </View>

        <View className="form-group">
          <Text className="form-group__label">书名 *</Text>
          <Input
            className="form-group__input"
            type="text"
            placeholder="请输入书名"
            value={form.title}
            onInput={(e) => handleChange('title', e.detail.value)}
          />
        </View>

        <View className="form-group">
          <Text className="form-group__label">作者 *</Text>
          <Input
            className="form-group__input"
            type="text"
            placeholder="请输入作者"
            value={form.author}
            onInput={(e) => handleChange('author', e.detail.value)}
          />
        </View>

        <View className="form-group">
          <Text className="form-group__label">状态 *</Text>
          <Picker mode="selector" range={STATUS_OPTIONS.map((s) => s.label)} value={statusIndex} onChange={handleStatusChange}>
            <View className="form-group__picker">
              <Text>{STATUS_OPTIONS[statusIndex]?.label || '已拥有'}</Text>
              <Text className="form-group__picker-arrow">▼</Text>
            </View>
          </Picker>
        </View>

        <View className="form-group">
          <Text className="form-group__label">分类</Text>
          <Picker mode="selector" range={categoryRange} value={categoryIndex} onChange={handleCategoryChange}>
            <View className="form-group__picker">
              <Text>{categoryRange[categoryIndex] || '不选择'}</Text>
              <Text className="form-group__picker-arrow">▼</Text>
            </View>
          </Picker>
        </View>

        <View className="form-group">
          <Text className="form-group__label">ISBN</Text>
          <Input
            className="form-group__input"
            type="text"
            placeholder="请输入 ISBN"
            value={form.isbn}
            onInput={(e) => handleChange('isbn', e.detail.value)}
          />
        </View>

        <View className="form-group">
          <Text className="form-group__label">页数</Text>
          <Input
            className="form-group__input"
            type="number"
            placeholder="请输入页数"
            value={form.pageCount}
            onInput={(e) => handleChange('pageCount', e.detail.value)}
          />
        </View>

        <View className="form-group">
          <Text className="form-group__label">出版日期</Text>
          <Picker mode="date" value={form.publishedDate || ''} onChange={(e) => handleChange('publishedDate', e.detail.value)}>
            <View className="form-group__picker">
              <Text>{form.publishedDate || '选择日期'}</Text>
              <Text className="form-group__picker-arrow">▼</Text>
            </View>
          </Picker>
        </View>

        <View className="form-group">
          <Text className="form-group__label">简介</Text>
          <Textarea
            className="form-group__textarea"
            placeholder="请输入书籍简介（最多1000字）"
            value={form.description}
            onInput={(e) => handleChange('description', e.detail.value)}
            maxlength={1000}
          />
        </View>
      </ScrollView>

      <View className="form-actions">
        <Button className="submit-btn" onClick={handleSubmit} loading={submitting}>
          {isEdit ? '保存修改' : '创建书籍'}
        </Button>
      </View>
    </View>
  )
}
