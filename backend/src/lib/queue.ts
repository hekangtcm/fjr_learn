import { Queue, Worker, QueueEvents } from 'bullmq'
import IORedis from 'ioredis'

const redis = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
})

export const queueConnection = redis as any

export const orderQueue = new Queue('order', { connection: queueConnection })
export const importQueue = new Queue('import', { connection: queueConnection })

export const orderQueueEvents = new QueueEvents('order', { connection: queueConnection })
export const importQueueEvents = new QueueEvents('import', { connection: queueConnection })

export { Worker }
