import { Button, Image, ScrollView, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { mockBooks } from '@/mocks/books'
import './index.scss'

export default function BookDetailPage() {
  const [book] = useState(() => mockBooks[0])

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
              <Text className="meta-item__value">{book.status}</Text>
            </View>
            {book.pageCount && (
              <View className="meta-item">
                <Text className="meta-item__label">页数</Text>
                <Text className="meta-item__value">{book.pageCount} 页</Text>
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
        <Button
          className="action-btn action-btn--edit"
          onClick={() => Taro.navigateTo({ url: `/pages/books/form/index?id=${book.id}` })}
        >
          编辑
        </Button>
      </View>
    </View>
  )
}
