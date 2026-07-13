import swaggerUi from 'swagger-ui-express'
import { generateOpenApiDocument } from './lib/openapi'
import express, { type Request, type Response, type NextFunction } from 'express'
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
app.set('strict routing', true)

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

// Security: CORS — 白名单 + 不反射 Origin，不携带 Credentials
// 注意：JWT 认证通过 Authorization header 传递，无需 Cookie/Credentials
const serverIp = 'http://47.103.214.67'
const allowedOrigins = isProduction
  ? [serverIp, 'https://www.yourdomain.com'].filter(Boolean) as string[]
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
  // 不设置 credentials: true — 不使用 Cookie，JWT 通过 Header 传递
  // 避免 CORS 反射 + Credentials 的安全漏洞
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
  optionsSuccessStatus: 204,
  maxAge: 86400,
}))

// 安全：禁止 HEAD 请求挂起（包括 curl -X HEAD 非标准用法）
app.use((req, res, next) => {
  if (req.method === 'HEAD') {
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

// 安全：防止 NoSQL 注入（DoS）— 拒绝包含 MongoDB 操作符的查询参数
app.use((req, res, next) => {
  // 方法 1：检查解码后的对象键（深度遍历）
  function hasNoSQLKeys(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false
    for (const key of Object.keys(obj)) {
      // MongoDB 操作符：以 $ 开头、包含 .（点注入）、或键名中包含 $（如 search[$ne]）
      if (key.startsWith('$') || key.includes('.') || key.includes('$')) return true
      const val = obj[key]
      if (val !== null && typeof val === 'object' && hasNoSQLKeys(val)) return true
    }
    return false
  }
  // 方法 2：检查原始 URL 字符串
  const rawUrl = req.url || ''
  const decodedUrl = decodeURIComponent(rawUrl)
  // 检测 URL 编码的 %24（$）出现在方括号中，如 search%5B%24ne%5D
  const hasEncodedOperators = /%5B%24[a-zA-Z]/.test(rawUrl)
  // 检测字面量 $ 操作符，如 search[$ne]、a.$ne
  const hasLiteralOperators = /\[\$[a-zA-Z]/.test(decodedUrl) || /\.\$[a-zA-Z]/.test(decodedUrl)

  if (hasNoSQLKeys(req.query) || hasNoSQLKeys(req.body) || hasEncodedOperators || hasLiteralOperators) {
    return res.status(400).json({ code: 400, message: 'Invalid query parameter' })
  }
  next()
})

// 安全：JSON 解析失败返回 400 而不是 500
app.use(express.json({
  type: 'application/json',
}))

// 捕获 JSON 解析错误（SyntaxError from body-parser）
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ code: 400, message: 'Invalid JSON' })
  }
  next(err)
})

// HTTP request logging
app.use(requestLogger)

// Health check routes (before rate limiting)
app.use(healthRoutes)

// 也挂载 /api/v1/health 供统一前缀访问
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// OpenAPI JSON endpoint
const openApiDocument = generateOpenApiDocument()
app.get('/openapi.json', (_req, res) => {
  res.json(openApiDocument)
})
app.get('/api/v1/openapi.json', (_req, res) => {
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
