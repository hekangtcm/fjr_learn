import { Request, Response, NextFunction } from 'express'
import { ResponseUtil } from '@/utils/response'
import * as workspaceService from '@/services/workspace.service'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaces = await workspaceService.listWorkspaces(req.user!.id)
    ResponseUtil.success(res, workspaces)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const workspace = await workspaceService.createWorkspace(req.user!.id, req.body)
    ResponseUtil.success(res, workspace, 'Workspace 创建成功', 201)
  } catch (err) {
    next(err)
  }
}

export async function members(req: Request, res: Response, next: NextFunction) {
  try {
    const members = await workspaceService.listMembers(req.workspace!.id)
    ResponseUtil.success(res, members)
  } catch (err) {
    next(err)
  }
}

export async function invite(req: Request, res: Response, next: NextFunction) {
  try {
    const invitation = await workspaceService.inviteMember(
      req.workspace!.id,
      req.user!.id,
      req.body,
    )
    ResponseUtil.success(res, invitation, '邀请已创建', 201)
  } catch (err) {
    next(err)
  }
}

export async function acceptInvitation(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await workspaceService.acceptInvitation(req.user!.id, req.params.token as string)
    ResponseUtil.success(res, member, '已接受邀请')
  } catch (err) {
    next(err)
  }
}

export async function updateMemberRole(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await workspaceService.updateMemberRole(
      req.workspace!.id,
      req.user!.id,
      req.params.memberId as string,
      req.body.role,
    )
    ResponseUtil.success(res, member, '角色已更新')
  } catch (err) {
    next(err)
  }
}
