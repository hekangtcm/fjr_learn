import { Text, View } from '@tarojs/components'
import './index.scss'

interface EmptyStateProps {
  message?: string
}

export default function EmptyState({ message = '暂无数据' }: EmptyStateProps) {
  return (
    <View className="empty-state">
      <Text className="empty-state__icon">📚</Text>
      <Text className="empty-state__message">{message}</Text>
    </View>
  )
}
