import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

// 通用 API 限流: 每 IP 每分钟 300 次（GET 请求为主，正常浏览不会触发）
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: { code: 429, message: '请求过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown'),
  skip: (req) => req.method === 'OPTIONS',
})

// 认证接口限流: 每 IP 每 15 分钟 20 次 (防暴力破解，但允许正常调试)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { code: 429, message: '尝试过多，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown'),
  skip: (req) => req.method === 'OPTIONS',
})

// 登录限流: 每 IP 每 15 分钟 10 次 (更严格，防暴力登录)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { code: 429, message: '登录尝试过多，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown'),
})

// 注册限流: 每 IP 每 15 分钟 20 次 (允许试错)
export const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { code: 429, message: '注册尝试过多，请15分钟后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip || 'unknown'),
})

// 上传限流: 每用户每分钟 10 次
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { code: 429, message: '上传过于频繁，请稍后再试' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: any) => req.user?.id || ipKeyGenerator(req.ip || 'unknown'),
})
