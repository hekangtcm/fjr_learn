import { ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import BookCard from '@/components/BookCard'
import EmptyState from '@/components/EmptyState'
import { mockBooks } from '@/mocks/books'
import './index.scss'

export default function IndexPage() {
  return (
    <View className="page">
      <View className="page__header">
        <Text className="page__title">BookNest Mini</Text>
        <Text className="page__subtitle">从 Web 迁移到微信小程序</Text>
      </View>

      <ScrollView scrollY className="book-list">
        {mockBooks.length > 0 ? (
          mockBooks.map((book) => (
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
