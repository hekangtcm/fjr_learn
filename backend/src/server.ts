import swaggerUi from 'swagger-ui-express'
import { generateOpenApiDocument } from './lib/openapi'
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

app.disable('x-powered-by')
app.set('case sensitive routing', true)

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
const serverIp = 'http://47.103.214.67'
const allowedOrigins = isProduction
  ? [process.env.FRONTEND_URL, serverIp, 'https://www.yourdomain.com'].filter(Boolean)
  : ['http://localhost:4001', 'http://127.0.0.1:4001', 'http://localhost:5173']

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      logger.warn('CORS blocked', { origin })
      callback(null, false)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
}))

// 安全：禁止 HEAD 请求挂起（不支持的路由直接返回 204）
app.use((req, res, next) => {
  if (req.method === 'HEAD' && !req.route) {
    res.status(204).end()
    return
  }
  next()
})

// 安全：防止 UTF-8 overlong 编码攻击（URIError）
app.use((req, res, next) => {
  try {
    decodeURIComponent(req.url)
    next()
  } catch (err) {
    res.status(400).json({ code: 400, message: 'Invalid URL encoding' })
  }
})

// 安全：禁止 UTF-7 等非 UTF-8 编码
app.use((req, res, next) => {
  const contentType = req.headers['content-type']
  if (contentType) {
    const ct = contentType.toLowerCase()
    if (ct.includes('charset=') && !ct.includes('utf-8')) {
      return res.status(415).json({ code: 415, message: 'Unsupported charset, only UTF-8 is supported' })
    }
  }
  next()
})

app.use(express.json())

// HTTP request logging
app.use(requestLogger)

// Health check routes (before rate limiting)
app.use(healthRoutes)

// OpenAPI JSON endpoint
const openApiDocument = generateOpenApiDocument()
app.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

// 静态文件服务（上传的封面图片）
app.get('/uploads/:filename', serveUploads)

// Rate limiting
app.use('/api/v1', apiLimiter)

app.use('/api/v1', routes)
app.use(errorHandler)

// 404 catch-all: 所有未匹配的 API 路径返回 JSON
app.use((_req, res) => {
  res.status(404).json({ code: 404, message: 'API endpoint not found' })
})

export default app
