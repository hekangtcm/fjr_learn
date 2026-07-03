import { Router } from 'express'
import prisma from '@/lib/prisma'
import redis from '@/lib/redis'
import logger from '@/lib/logger'

const router = Router()

// 简单存活检查 (用于负载均衡)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 深度健康检查 (用于监控)
router.get('/health/detailed', async (req, res) => {
  const checks: Record<string, any> = {}
  let isHealthy = true

  // 检查 PostgreSQL / SQLite
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1`
    checks.database = {
      status: 'ok',
      responseTime: `${Date.now() - start}ms`,
    }
  } catch (err) {
    isHealthy = false
    checks.database = { status: 'error', message: (err as Error).message }
  }

  // 检查 Redis
  try {
    const start = Date.now()
    await redis.ping()
    checks.redis = {
      status: 'ok',
      responseTime: `${Date.now() - start}ms`,
    }
  } catch (err) {
    isHealthy = false
    checks.redis = { status: 'error', message: (err as Error).message }
  }

  // 内存使用
  const memUsage = process.memoryUsage()
  checks.memory = {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
  }

  // 运行时间
  checks.uptime = `${Math.round(process.uptime())}s`

  const statusCode = isHealthy ? 200 : 503
  res.status(statusCode).json({
    status: isHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks,
  })

  if (!isHealthy) {
    logger.warn('Health check failed', { checks })
  }
})

export default router
