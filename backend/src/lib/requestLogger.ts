import morgan from 'morgan'
import logger from './logger'

// 自定义 Morgan 格式: 方法 路径 状态码 响应时间 字节数
const stream = {
  write: (message: string) => {
    const parts = message.trim().split(' ')
    const [method, url, status, responseTime, size] = parts
    logger.info('HTTP Request', {
      method,
      url,
      status: Number(status),
      responseTime: responseTime?.replace('ms', '') + 'ms',
      size: size || '0',
    })
  },
}

export const requestLogger = morgan(
  ':method :url :status :response-time ms :res[content-length]',
  { stream }
)
