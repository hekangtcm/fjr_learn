import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BookOpen, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/useAuthStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      await login(email, password)
      navigate('/')
    } catch {
      // error handled by store
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">BookNest</h2>
          <p className="mt-2 text-sm text-slate-500">登录您的账户</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700">邮箱</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@booknest.com"
              className="mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">密码</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500">
          没有账号？{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            去注册
          </Link>
        </p>
      </div>
    </div>
  )
}
