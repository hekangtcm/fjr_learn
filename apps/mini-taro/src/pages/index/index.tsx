import { useState, useCallback } from 'react'
import { Image, Input, ScrollView, Text, View } from '@tarojs/components'
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useBooks } from '@/hooks/use-books'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useCategories } from '@/hooks/use-categories'
import { useWorkspaceStore } from '@/stores/workspace-store'
import { WorkspaceSwitcher } from '@/components/WorkspaceSwitcher'
import { canCreateBook } from '@/utils/permissions'
import { useAuthStore } from '@/stores/auth-store'
import { getCoverThumbUrl } from '@/utils/image'
import './index.scss'

const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '已拥有', value: 'OWNED' },
  { label: '阅读中', value: 'READING' },
  { label: '已读完', value: 'FINISHED' },
  { label: '想读', value: 'WISHLIST' },
]

export default function IndexPage() {
  const { activeWorkspaceId } = useWorkspaceStore()
  const { data: workspaces = [] } = useWorkspaces()
  const { data: categories = [] } = useCategories()
  const { user } = useAuthStore()

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId)
  const userRole = activeWorkspace?.role || null

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useBooks(activeWorkspaceId, {
    keyword: keyword || undefined,
    status: status || undefined,
    categoryId: categoryId || undefined,
  })

  const books = data?.pages.flatMap((page) => page.items) || []

  usePullDownRefresh(() => {
    refetch().then(() => {
      Taro.stopPullDownRefresh()
    })
  })

  useReachBottom(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  })

  const handleSearch = useCallback((e: any) => {
    setKeyword(e.detail.value)
  }, [])

  const handleStatusChange = async () => {
    try {
      const res = await Taro.showActionSheet({
        itemList: STATUS_OPTIONS.map((s) => s.label),
      })
      setStatus(STATUS_OPTIONS[res.tapIndex].value)
    } catch {
      // cancel
    }
  }

  const handleCategoryChange = async () => {
    if (categories.length === 0) return
    try {
      const res = await Taro.showActionSheet({
        itemList: ['全部', ...categories.map((c) => c.name)],
      })
      if (res.tapIndex === 0) {
        setCategoryId('')
      } else {
        setCategoryId(categories[res.tapIndex - 1].id)
      }
    } catch {
      // cancel
    }
  }

  const activeStatusLabel = STATUS_OPTIONS.find((s) => s.value === status)?.label || '全部状态'
  const activeCategory = categories.find((c) => c.id === categoryId)

  const handleBookClick = (id: string) => {
    Taro.navigateTo({ url: `/sub/books/pages/detail/index?id=${id}` })
  }

  return (
    <View className="page">
      <WorkspaceSwitcher />

      <View className="search-bar">
        <Input
          className="search-bar__input"
          type="text"
          placeholder="搜索书名或作者..."
          value={keyword}
          onInput={handleSearch}
          onConfirm={handleSearch}
        />
      </View>

      <View className="filter-bar">
        <View className="filter-item" onClick={handleStatusChange}>
          <Text className="filter-item__text">{activeStatusLabel}</Text>
          <Text className="filter-item__arrow">▼</Text>
        </View>
        <View className="filter-item" onClick={handleCategoryChange}>
          <Text className="filter-item__text">{activeCategory?.name || '全部分类'}</Text>
          <Text className="filter-item__arrow">▼</Text>
        </View>
      </View>

      <ScrollView scrollY className="book-list" enablePullDownRefresh>
        {isLoading ? (
          <View className="state-message">
            <Text className="state-message__text">加载中...</Text>
          </View>
        ) : isError ? (
          <View className="state-message">
            <Text className="state-message__text">加载失败</Text>
            <Text className="state-message__sub">{(error as Error)?.message || '请检查网络'}</Text>
          </View>
        ) : books.length === 0 ? (
          <View className="state-message">
            <Text className="state-message__text">暂无书籍</Text>
            <Text className="state-message__sub">点击右下角添加第一本书</Text>
          </View>
        ) : (
          <>
            {books.map((book) => (
              <View
                key={book.id}
                className="book-item"
                onClick={() => handleBookClick(book.id)}
              >
                <Image
                  className="book-item__cover"
                  src={getCoverThumbUrl(book.coverUrl)}
                  mode="aspectFill"
                  lazyLoad
                />
                <View className="book-item__info">
                  <Text className="book-item__title">{book.title}</Text>
                  <Text className="book-item__author">{book.author}</Text>
                  <View className="book-item__meta">
                    <Text className={`book-item__status book-item__status--${book.status.toLowerCase()}`}>
                      {book.status === 'OWNED' && '已拥有'}
                      {book.status === 'READING' && '阅读中'}
                      {book.status === 'FINISHED' && '已读完'}
                      {book.status === 'WISHLIST' && '想读'}
                    </Text>
                    {book.category && (
                      <Text className="book-item__category" style={{ background: book.category.color }}>
                        {book.category.name}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
            {isFetchingNextPage && (
              <View className="load-more">
                <Text className="load-more__text">加载更多...</Text>
              </View>
            )}
            {!hasNextPage && books.length > 0 && (
              <View className="load-more">
                <Text className="load-more__text">没有更多了</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {canCreateBook(userRole) && (
        <View
          className="fab"
          onClick={() => Taro.navigateTo({ url: '/sub/books/pages/form/index' })}
        >
          +
        </View>
      )}
    </View>
  )
}
