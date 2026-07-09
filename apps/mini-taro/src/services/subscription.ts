import Taro from '@tarojs/taro'
import { request } from './request'

const TEMPLATE_IDS = {
  activityReminder: 'your-template-id',
  signupSuccess: 'your-template-id',
}

export async function subscribeActivityReminder(activityId: string) {
  const tmplId = TEMPLATE_IDS.activityReminder
  const result = await Taro.requestSubscribeMessage({
    tmplIds: [tmplId],
  })

  await request({
    url: '/subscriptions/record',
    method: 'POST',
    data: {
      templateId: tmplId,
      scene: 'ACTIVITY_REMINDER',
      refType: 'ACTIVITY',
      refId: activityId,
      result,
    },
  })

  return (result as Record<string, string>)[tmplId]
}
