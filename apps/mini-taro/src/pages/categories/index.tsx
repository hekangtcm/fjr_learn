import { Text, View } from '@tarojs/components'
import { mockCategories } from '@/mocks/books'
import './index.scss'

export default function CategoriesPage() {
  return (
    <View className="page">
      <View className="page__header">
        <Text className="page__title">分类</Text>
      </View>

      <View className="category-list">
        {mockCategories.map((cat) => (
          <View key={cat.id} className="category-item" style={{ borderLeftColor: cat.color }}>
            <Text className="category-item__name">{cat.name}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
