import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  // 开发环境：Redis 未安装时不阻塞请求
  maxRetriesPerRequest: process.env.NODE_ENV === 'production' ? 3 : 0,
  retryStrategy(times) {
    if (process.env.NODE_ENV !== 'production') {
      return null // 开发环境不重试
    }
    const delay = Math.min(times * 200, 2000)
    return delay
  },
  // 如果 Redis 连接失败，不阻塞应用启动
  lazyConnect: true,
})

redis.on('error', (err) => {
  // 静默处理连接错误，不阻塞请求
  if (process.env.NODE_ENV !== 'production') {
    // 开发环境不打印频繁错误
    return
  }
  console.error('Redis connection error:', err.message)
})

redis.on('connect', () => {
  console.log('Redis connected')
})

redis.on('ready', () => {
  console.log('Redis ready')
})

export default redis
