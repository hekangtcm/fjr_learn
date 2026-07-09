export const wechatPayConfig = {
  mode: (process.env.WECHAT_PAY_MODE || 'mock') as 'mock' | 'real',
  appId: process.env.WECHAT_APP_ID || '',
  mchId: process.env.WECHAT_MCH_ID || '',
  serialNo: process.env.WECHAT_PAY_SERIAL_NO || '',
  apiV3Key: process.env.WECHAT_PAY_API_V3_KEY || '',
  privateKeyPath: process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '',
  notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL || '',
}

export type WechatPayMode = 'mock' | 'real'
