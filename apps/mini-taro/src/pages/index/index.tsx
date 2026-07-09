import { ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BookCard from '@/components/BookCard'
import EmptyState from '@/components/EmptyState'
import { useBooks } from '@/hooks/use-books'
import { useWorkspaceStore } from '@/stores/workspace-store'
import './index.scss'

export default function IndexPage() {
  const { activeWorkspaceId } = useWorkspaceStore()
  const { data, isLoading } = useBooks(activeWorkspaceId, { page: 1, pageSize: 20 })

  return (
    <View className="page">
      <View className="page__header">
        <Text className="page__title">BookNest Mini</Text>
        <Text className="page__subtitle">真实 API 数据</Text>
      </View>

      <ScrollView scrollY className="book-list">
        {isLoading ? (
          <Text style={{ textAlign: 'center', padding: '40rpx', color: '#94a3b8' }}>加载中...</Text>
        ) : data?.items && data.items.length > 0 ? (
          data.items.map((book) => (
            <BookCard key={book.id} book={book} />
          ))
        ) : (
          <EmptyState message="还没有书籍，点击右下角添加" />
        )}
      </ScrollView>

      <View
        className="fab"
        onClick={() => Taro.navigateTo({ url: '/pages/books/form/index' })}
      >
        +
      </View>
    </View>
  )
}
