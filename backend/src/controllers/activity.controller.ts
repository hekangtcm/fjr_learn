import type { Request, Response } from 'express'
import { ResponseUtil } from '../utils/response'
import * as activityService from '../services/activity.service'

export async function list(req: Request, res: Response) {
  const activities = await activityService.listActivities(req.workspace!.id)
  ResponseUtil.success(res, activities)
}

export async function getById(req: Request, res: Response) {
  const activity = await activityService.getActivity(req.workspace!.id, req.params.id as string)
  ResponseUtil.success(res, activity)
}

export async function create(req: Request, res: Response) {
  const activity = await activityService.createActivity(req.user!.id, req.workspace!.id, req.body)
  ResponseUtil.success(res, activity, '活动创建成功', 201)
}
