import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from './middleware/errorHandler'
import routes from './routes'

const app = express()

const isProduction = process.env.NODE_ENV === 'production'

// Security: Helmet — 安全响应头
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false, // 开发环境禁用 CSP（防止影响调试）
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? {
    maxAge: 31536000, // 1 年
    includeSubDomains: true,
    preload: true,
  } : false, // 开发环境禁用 HSTS
}))

// Security: CORS — 只允许指定域名
const allowedOrigins = isProduction
  ? [
      process.env.FRONTEND_URL,      // 如 https://yourdomain.com
      'https://www.yourdomain.com',
    ].filter(Boolean)
  : ['http://localhost:4001', 'http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    // 允许无来源的请求（如 curl 调用）或白名单内的请求
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked: ${origin}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/v1', routes)
app.use(errorHandler)

export default app
