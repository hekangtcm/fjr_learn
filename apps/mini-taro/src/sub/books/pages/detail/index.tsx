import { useState } from 'react'
import { Button, Image, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro'
import { useBookDetail } from '@/hooks/use-book-detail'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { canEditBook, canDeleteBook } from '@/utils/permissions'
import { deleteBook } from '@/services/books'
import './index.scss'

export default function BookDetailPage() {
  const router = useRouter()
  const id = router.params.id
  const { activeWorkspaceId } = useWorkspaceStore()
  const { data: workspaces = [] } = useWorkspaces()

  const { data: book, isLoading, isError, refetch } = useBookDetail(id || '')

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const userRole = activeWorkspace?.role || null

  const [deleting, setDeleting] = useState(false)

  useShareAppMessage(() => ({
    title: book ? `推荐一本书：${book.title}` : 'BookNest 书籍详情',
    path: `/sub/books/pages/detail/index?id=${id}`,
    imageUrl: book?.coverUrl || undefined,
  }))

  const handleEdit = () => {
    Taro.navigateTo({ url: `/sub/books/pages/form/index?id=${id}` })
  }

  const handleDelete = async () => {
    const res = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除《${book?.title}》吗？此操作不可恢复。`,
      confirmColor: '#ef4444',
    })
    if (!res.confirm) return

    setDeleting(true)
    try {
      await deleteBook(id!)
      Taro.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1000)
    } catch (e: any) {
      Taro.showToast({ title: e.message || '删除失败', icon: 'none' })
    } finally {
      setDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <View className="page">
        <View className="detail-loading">
          <Text className="detail-loading__text">加载中...</Text>
        </View>
      </View>
    )
  }

  if (isError || !book) {
    return (
      <View className="page">
        <View className="detail-loading">
          <Text className="detail-loading__text">加载失败</Text>
          <Button className="detail-loading__btn" onClick={() => refetch()}>
            重试
          </Button>
        </View>
      </View>
    )
  }

  const statusText = {
    OWNED: '已拥有',
    READING: '阅读中',
    FINISHED: '已读完',
    WISHLIST: '想读',
  }[book.status]

  return (
    <View className="page">
      <ScrollView scrollY className="detail-scroll">
        <Image
          className="detail-cover"
          src={book.coverUrl || '/assets/default-cover.png'}
          mode="aspectFill"
        />

        <View className="detail-body">
          <Text className="detail-title">{book.title}</Text>
          <Text className="detail-author">{book.author}</Text>

          <View className="detail-meta">
            <View className="meta-item">
              <Text className="meta-item__label">状态</Text>
              <Text className={`meta-item__value meta-item__value--${book.status.toLowerCase()}`}>
                {statusText}
              </Text>
            </View>
            {book.category && (
              <View className="meta-item">
                <Text className="meta-item__label">分类</Text>
                <Text className="meta-item__value" style={{ background: book.category.color, color: '#fff', padding: '4rpx 16rpx', borderRadius: '8rpx' }}>
                  {book.category.name}
                </Text>
              </View>
            )}
            {book.pageCount && (
              <View className="meta-item">
                <Text className="meta-item__label">页数</Text>
                <Text className="meta-item__value">{book.pageCount} 页</Text>
              </View>
            )}
            {book.isbn && (
              <View className="meta-item">
                <Text className="meta-item__label">ISBN</Text>
                <Text className="meta-item__value">{book.isbn}</Text>
              </View>
            )}
            {book.publishedDate && (
              <View className="meta-item">
                <Text className="meta-item__label">出版日期</Text>
                <Text className="meta-item__value">{book.publishedDate}</Text>
              </View>
            )}
          </View>

          {book.description && (
            <View className="detail-section">
              <Text className="detail-section__title">简介</Text>
              <Text className="detail-section__content">{book.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="detail-actions">
        {canEditBook(userRole) && (
          <Button className="action-btn action-btn--edit" onClick={handleEdit}>
            编辑
          </Button>
        )}
        {canDeleteBook(userRole) && (
          <Button
            className="action-btn action-btn--delete"
            onClick={handleDelete}
            loading={deleting}
          >
            删除
          </Button>
        )}
      </View>
    </View>
  )
}
