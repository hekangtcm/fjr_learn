import { request } from './request'

export async function recordCustomerServiceEvent(
  scene: string,
  refType?: string,
  refId?: string,
  payload?: Record<string, unknown>
) {
  return request<null>({
    url: '/customer-service/events',
    method: 'POST',
    data: { scene, refType, refId, payload },
  })
}
