import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const { combine, timestamp, printf, colorize, json } = winston.format

// 自定义控制台格式
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : ''
  return `${timestamp} [${level}]: ${message} ${metaStr}`
})

// 日志轮转配置 — 所有日志
const fileRotateTransport = new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp(), json()),
})

// 日志轮转配置 — 仅错误
const errorRotateTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: combine(timestamp(), json()),
})

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
  defaultMeta: { service: 'booknest-api' },
  transports: [
    // 控制台 (开发环境用彩色格式)
    new winston.transports.Console({
      format: combine(colorize(), consoleFormat),
    }),
    // 文件 (所有日志)
    fileRotateTransport,
    // 文件 (仅错误)
    errorRotateTransport,
  ],
  // 未捕获的异常不重复输出 (由 index.ts 处理)
  exitOnError: false,
})

export default logger
