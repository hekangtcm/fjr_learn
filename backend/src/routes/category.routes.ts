import { Router } from 'express'
import { body } from 'express-validator'
import { categoryController } from '../controllers/category.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { resolveWorkspace } from '../middleware/workspace'

const router = Router()

const createRules = [
  body('name').notEmpty().trim().isLength({ max: 50 }),
  body('color').notEmpty().matches(/^#[0-9A-Fa-f]{6}$/),
]

router.get('/', authenticate, resolveWorkspace, categoryController.list)
router.post('/', authenticate, resolveWorkspace, createRules, validate, categoryController.create)
router.put('/:id', authenticate, resolveWorkspace, createRules, validate, categoryController.update)
router.delete('/:id', authenticate, resolveWorkspace, categoryController.delete)

export default router
