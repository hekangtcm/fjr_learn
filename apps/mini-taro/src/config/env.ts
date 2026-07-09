import Taro from '@tarojs/taro'

/**
 * 小程序环境 → API 基础地址映射
 *
 * develop:  开发版（微信开发者工具 / 真机调试）
 * trial:    体验版（上传后管理员 / 体验成员可用）
 * release:  正式版（微信用户访问）
 *
 * 注意：微信小程序要求 request / uploadFile 域名必须为 HTTPS
 * 且已备案。当前使用阿里云 ECS IP，正式发布前需绑定域名 + SSL。
 */
const API_MAP = {
  develop: 'http://47.103.214.67/api/v1',
  trial: 'http://47.103.214.67/api/v1',
  release: 'http://47.103.214.67/api/v1',
}

export function getEnvVersion(): 'develop' | 'trial' | 'release' {
  const accountInfo = Taro.getAccountInfoSync?.()
  return accountInfo?.miniProgram?.envVersion || 'develop'
}

export const ENV_VERSION = getEnvVersion()
export const API_BASE_URL = API_MAP[ENV_VERSION] || API_MAP.develop
