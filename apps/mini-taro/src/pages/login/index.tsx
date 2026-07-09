import { Button, Input, Text, View } from '@tarojs/components'
import { useState } from 'react'
import './index.scss'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View className="page login-page">
      <Text className="login-page__title">登录 BookNest</Text>

      <View className="form-group">
        <Text className="form-group__label">邮箱</Text>
        <Input
          className="form-group__input"
          type="text"
          placeholder="请输入邮箱"
          value={email}
          onInput={(e) => setEmail(e.detail.value)}
        />
      </View>

      <View className="form-group">
        <Text className="form-group__label">密码</Text>
        <Input
          className="form-group__input"
          type="password"
          placeholder="请输入密码"
          value={password}
          onInput={(e) => setPassword(e.detail.value)}
        />
      </View>

      <Button className="login-btn">登录</Button>
      <Button className="register-btn">注册</Button>
    </View>
  )
}
