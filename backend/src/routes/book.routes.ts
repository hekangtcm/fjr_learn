import { Router } from 'express'
import { bookController } from '../controllers/book.controller'
import { uploadCover } from '../controllers/upload.controller'
import { authenticate } from '../middleware/auth'
import { validateBody, validateQuery } from '../middleware/zodValidate'
import { upload } from '../middleware/upload'
import { uploadLimiter } from '../middleware/rateLimit'
import {
  createBookBodySchema,
  updateBookBodySchema,
  listBooksQuerySchema,
} from '../schemas/book.schema'

const router = Router()

router.get('/', authenticate, validateQuery(listBooksQuerySchema), bookController.list)
router.get('/:id', authenticate, bookController.getById)
router.post('/', authenticate, validateBody(createBookBodySchema), bookController.create)
router.put('/:id', authenticate, validateBody(updateBookBodySchema), bookController.update)
router.delete('/:id', authenticate, bookController.delete)

// 封面上传
router.post(
  '/:id/cover',
  authenticate,
  uploadLimiter,
  upload.single('cover'),
  uploadCover
)

export default router
