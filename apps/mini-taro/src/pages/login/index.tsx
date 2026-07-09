import { Button, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { loginByWechat } from '@/services/auth'
import './index.scss'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async () => {
    try {
      await loginByWechat()
      const redirect = router.params.redirect
      Taro.redirectTo({ url: redirect ? decodeURIComponent(redirect) : '/pages/index/index' })
    } catch (err: any) {
      Taro.showToast({ title: err.message || '登录失败', icon: 'none' })
    }
  }

  return (
    <View className="login-page">
      <Text className="login-page__title">登录 BookNest Mini</Text>
      <Text className="login-page__desc">使用微信身份进入你的团队书架</Text>
      <Button type="primary" onClick={handleLogin}>微信一键登录</Button>
    </View>
  )
}
