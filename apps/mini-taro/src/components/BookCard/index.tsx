import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Book } from '@booknest/domain'
import './index.scss'

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  const handleOpen = () => {
    Taro.navigateTo({ url: `/pages/books/detail/index?id=${book.id}` })
  }

  return (
    <View className="book-card" onClick={handleOpen}>
      <Image
        className="book-card__cover"
        src={book.coverUrl || '/assets/default-cover.png'}
        mode="aspectFill"
        lazyLoad
      />
      <View className="book-card__body">
        <Text className="book-card__title">{book.title}</Text>
        <Text className="book-card__author">{book.author}</Text>
        <Text className="book-card__status">{book.status}</Text>
      </View>
    </View>
  )
}
