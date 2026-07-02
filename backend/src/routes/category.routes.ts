import { Router } from 'express'
import { body } from 'express-validator'
import { categoryController } from '../controllers/category.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const createRules = [
  body('name').notEmpty().trim().isLength({ max: 50 }),
  body('color').notEmpty().matches(/^#[0-9A-Fa-f]{6}$/),
]

router.get('/', authenticate, categoryController.list)
router.post('/', authenticate, createRules, validate, categoryController.create)
router.put('/:id', authenticate, createRules, validate, categoryController.update)
router.delete('/:id', authenticate, categoryController.delete)

export default router
