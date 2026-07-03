import dotenv from 'dotenv'
dotenv.config()

import { createServer } from 'http'
import app from './server'
import { initSocket } from './lib/socket'
import logger from './lib/logger'

const PORT = process.env.PORT || 4000
const server = createServer(app)
initSocket(server)

server.listen(PORT, () => {
  logger.info(`Server running`, { port: PORT, env: process.env.NODE_ENV || 'development' })
})

// 捕获未处理的 Promise 拒绝
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection', { reason: reason?.message || reason, stack: reason?.stack })
})

// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack })
  // 严重错误，优雅退出
  process.exit(1)
})
