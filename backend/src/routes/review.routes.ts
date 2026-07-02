import { Router } from 'express'
import { body, param } from 'express-validator'
import { reviewController } from '../controllers/review.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router({ mergeParams: true })

const createRules = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('text').optional().trim(),
]

router.get('/:bookId/reviews', authenticate, reviewController.listByBook)
router.post('/:bookId/reviews', authenticate, createRules, validate, reviewController.create)

export default router
