import { Router } from 'express'
import { body } from 'express-validator'
import { authController } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

const registerRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
]

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
]

router.post('/register', registerRules, validate, authController.register)
router.post('/login', loginRules, validate, authController.login)
router.get('/me', authenticate, authController.me)

export default router
