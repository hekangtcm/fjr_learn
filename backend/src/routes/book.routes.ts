import { Router } from 'express'
import { body } from 'express-validator'
import { bookController } from '../controllers/book.controller'
import { uploadCover } from '../controllers/upload.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { upload } from '../middleware/upload'
import { uploadLimiter } from '../middleware/rateLimit'

const router = Router()

const createRules = [
  body('title').notEmpty().trim().isLength({ max: 200 }),
  body('author').notEmpty().trim().isLength({ max: 100 }),
  body('status').optional().isIn(['OWNED', 'READING', 'FINISHED', 'WISHLIST']),
  body('pageCount').optional().isInt({ min: 1 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
]

router.get('/', authenticate, bookController.list)
router.get('/:id', authenticate, bookController.getById)
router.post('/', authenticate, createRules, validate, bookController.create)
router.put('/:id', authenticate, createRules, validate, bookController.update)
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
