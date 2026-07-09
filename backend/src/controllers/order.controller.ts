import type { Request, Response } from 'express'
import { ResponseUtil } from '../utils/response'
import * as orderService from '../services/order.service'

export async function listMyOrders(req: Request, res: Response) {
  const orders = await orderService.listMyOrders(req.user!.id, req.workspace!.id)
  ResponseUtil.success(res, orders)
}

export async function create(req: Request, res: Response) {
  const order = await orderService.createOrder(req.user!.id, req.workspace!.id, req.body.activityId)
  ResponseUtil.success(res, order, '订单创建成功', 201)
}

export async function getOrder(req: Request, res: Response) {
  const order = await orderService.getOrder(req.params.id as string, req.user!.id, req.workspace!.id)
  ResponseUtil.success(res, order)
}
