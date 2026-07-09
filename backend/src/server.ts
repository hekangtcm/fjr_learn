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
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
}))

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

export default app
