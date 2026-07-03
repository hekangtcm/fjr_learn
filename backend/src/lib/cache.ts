import redis from './redis'

interface CacheOptions {
  ttl: number
  prefix?: string
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      if (!data) return null
      return JSON.parse(data)
    } catch {
      return null
    }
  },

  async set(key: string, value: unknown, ttl: number): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (err) {
      console.error('Cache set error:', (err as Error).message)
    }
  },

  async del(pattern: string): Promise<void> {
    try {
      if (pattern.includes('*')) {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } else {
        await redis.del(pattern)
      }
    } catch (err) {
      console.error('Cache del error:', (err as Error).message)
    }
  },

  async getOrSet<T>(key: string, fn: () => Promise<T>, ttl: number): Promise<T> {
    const cached = await cache.get<T>(key)
    if (cached !== null) return cached

    const data = await fn()
    await cache.set(key, data, ttl)
    return data
  },
}
