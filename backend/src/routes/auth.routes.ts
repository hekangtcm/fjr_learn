import { Router } from 'express'
import { body } from 'express-validator'
import { authController } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import { registerLimiter, loginLimiter } from '../middleware/rateLimit'

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

router.post('/register', registerLimiter, registerRules, validate, authController.register)
router.post('/login', loginLimiter, loginRules, validate, authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authenticate, authController.logout)
router.post('/forgot-password', authController.forgotPassword)
router.get('/me', authenticate, authController.me)

export default router
