const dotenv = require('dotenv')

dotenv.config({ path: '.env.test' })

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    setex: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    ping: jest.fn().mockResolvedValue('PONG'),
    quit: jest.fn().mockResolvedValue(undefined),
  }))
})

// Mock socket.io Server
jest.mock('socket.io', () => {
  return {
    Server: jest.fn().mockImplementation(() => ({
      use: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn().mockReturnThis(),
      close: jest.fn().mockResolvedValue(undefined),
    })),
  }
})

// Mock cache module
jest.mock('@/lib/cache', () => ({
  cache: {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    getOrSet: jest.fn().mockImplementation(async (_key, fn) => fn()),
    del: jest.fn().mockResolvedValue(undefined),
  },
}))

// Mock socket module
jest.mock('@/lib/socket', () => ({
  initSocket: jest.fn().mockReturnValue({
    use: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    emit: jest.fn().mockReturnThis(),
  }),
  getIO: jest.fn().mockReturnValue({
    to: jest.fn().mockReturnThis(),
    emit: jest.fn().mockReturnThis(),
  }),
  notifyUser: jest.fn(),
}))
