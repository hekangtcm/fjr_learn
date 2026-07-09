import { Router } from 'express'
import { bookController } from '../controllers/book.controller'
import { uploadCover } from '../controllers/upload.controller'
import { authenticate } from '../middleware/auth'
import { validateBody, validateQuery } from '../middleware/zodValidate'
import { upload } from '../middleware/upload'
import { uploadLimiter } from '../middleware/rateLimit'
import { resolveWorkspace, resolveWorkspaceOptional } from '../middleware/workspace'
import {
  createBookBodySchema,
  updateBookBodySchema,
  listBooksQuerySchema,
} from '../schemas/book.schema'

const router = Router()

// 公开路由：浏览不需要认证，可选 Workspace
router.use(resolveWorkspaceOptional)
router.get('/', validateQuery(listBooksQuerySchema), bookController.list)
router.get('/:id', bookController.getById)

// 需要认证的路由
router.use(authenticate, resolveWorkspace)
router.post('/', validateBody(createBookBodySchema), bookController.create)
router.put('/:id', validateBody(updateBookBodySchema), bookController.update)
router.delete('/:id', bookController.delete)

// 封面上传
router.post(
  '/:id/cover',
  uploadLimiter,
  upload.single('cover'),
  uploadCover
)

export default router
