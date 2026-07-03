import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { errorHandler } from './middleware/errorHandler'
import { apiLimiter } from './middleware/rateLimit'
import { serveUploads } from './controllers/upload.controller'
import routes from './routes'
import healthRoutes from './routes/health.routes'

import logger from './lib/logger'
import { requestLogger } from './lib/requestLogger'

const app = express()

const isProduction = process.env.NODE_ENV === 'production'

// Security: Helmet
app.use(helmet({
  contentSecurityPolicy: isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
}))

// Security: CORS
const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL, 'https://www.yourdomain.com'].filter(Boolean)
  : ['http://localhost:4001', 'http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn(`CORS blocked`, { origin })
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json())

// HTTP request logging
app.use(requestLogger)

// Health check routes (before rate limiting)
app.use(healthRoutes)

// 静态文件服务（上传的封面图片）
app.get('/uploads/:filename', serveUploads)

// Rate limiting
app.use('/api/v1', apiLimiter)

app.use('/api/v1', routes)
app.use(errorHandler)

export default app
