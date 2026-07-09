import { Button, Input, Text, View } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function BookFormPage() {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  return (
    <View className="page form-page">
      <View className="page__header">
        <Text className="page__title">添加书籍</Text>
      </View>

      <View className="form-group">
        <Text className="form-group__label">书名 *</Text>
        <Input
          className="form-group__input"
          type="text"
          placeholder="请输入书名"
          value={title}
          onInput={(e) => setTitle(e.detail.value)}
        />
      </View>

      <View className="form-group">
        <Text className="form-group__label">作者 *</Text>
        <Input
          className="form-group__input"
          type="text"
          placeholder="请输入作者"
          value={author}
          onInput={(e) => setAuthor(e.detail.value)}
        />
      </View>

      <Button className="submit-btn">保存</Button>
    </View>
  )
}
