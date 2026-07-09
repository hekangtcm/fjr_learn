import { request } from './request'

export interface PayParams {
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'RSA' | 'MD5'
  paySign: string
  mock?: boolean
}

export async function createPrepay(orderId: string) {
  return request<PayParams>({
    url: '/wechat-pay/prepay',
    method: 'POST',
    data: { orderId },
  })
}

export async function mockPayCallback(orderId: string, success = true) {
  return request<unknown>({
    url: '/wechat-pay/mock-callback',
    method: 'POST',
    data: { orderId, success },
  })
}
