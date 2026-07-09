import Taro from '@tarojs/taro'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions<TBody = unknown> {
  url: string
  method?: HttpMethod
  data?: TBody
  auth?: boolean
  showErrorToast?: boolean
}

interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

const API_BASE_URL = process.env.TARO_APP_API || 'http://47.103.214.67/api/v1'

export async function request<T, TBody = unknown>(options: RequestOptions<TBody>): Promise<T> {
  const token = Taro.getStorageSync<string>('booknest_token') || ''
  const activeWorkspaceId = Taro.getStorageSync<string>('booknest_workspace_id') || ''

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.auth !== false && token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (activeWorkspaceId) {
    headers['X-Workspace-Id'] = activeWorkspaceId
  }

  const fullUrl = options.method === 'GET' && options.data
    ? buildUrlWithQuery(`${API_BASE_URL}${options.url}`, options.data as Record<string, unknown>)
    : `${API_BASE_URL}${options.url}`

  try {
    const res = await Taro.request<ApiResponse<T>>({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.method !== 'GET' ? options.data : undefined,
      header: headers,
    })

    if (res.statusCode === 401) {
      Taro.removeStorageSync('booknest_token')
      Taro.removeStorageSync('booknest_user')
      Taro.navigateTo({ url: `/pages/login/index` })
      throw new Error('登录已失效，请重新登录')
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(res.data?.message || `请求失败：${res.statusCode}`)
    }

    return res.data.data
  } catch (error) {
    const message = error instanceof Error ? error.message : '网络请求失败'
    if (options.showErrorToast !== false) {
      Taro.showToast({ title: message, icon: 'none' })
    }
    throw error
  }
}

function buildUrlWithQuery(baseUrl: string, params: Record<string, unknown>) {
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&')
  return qs ? `${baseUrl}?${qs}` : baseUrl
}
