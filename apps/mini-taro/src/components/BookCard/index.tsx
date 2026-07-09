import { memo } from 'react'
import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Book } from '@booknest/domain'
import { getCoverThumbUrl } from '@/utils/image'
import './index.scss'

interface BookCardProps {
  book: Book
}

function BookCard({ book }: BookCardProps) {
  const handleOpen = () => {
    Taro.navigateTo({ url: `/sub/books/pages/detail/index?id=${book.id}` })
  }

  return (
    <View className="book-card" onClick={handleOpen}>
      <Image
        className="book-card__cover"
        src={getCoverThumbUrl(book.coverUrl)}
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

export default memo(BookCard)
