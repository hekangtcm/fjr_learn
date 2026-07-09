import { Button, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function MePage() {
  return (
    <View className="page">
      <View className="page__header">
        <Text className="page__title">我的</Text>
      </View>

      <View className="profile">
        <View className="profile__avatar">
          <Text className="profile__avatar-text">👤</Text>
        </View>
        <Text className="profile__name">未登录</Text>
      </View>

      <Button
        className="login-btn"
        onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
      >
        登录 / 注册
      </Button>
    </View>
  )
}
