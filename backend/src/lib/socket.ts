import { Server as SocketServer } from 'socket.io'
import type { Server } from 'http'
import jwt from 'jsonwebtoken'

let io: SocketServer

export function initSocket(server: Server) {
  io = new SocketServer(server, {
    cors: {
      origin: (origin, callback) => {
        const allowed = [
          process.env.FRONTEND_URL,
          'http://localhost:4001',
          'http://localhost:5173',
        ].filter(Boolean)
        if (!origin || allowed.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true,
    },
  })

  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error: no token'))
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string }
      socket.data.userId = decoded.id
      next()
    } catch {
      next(new Error('Authentication error: invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: user ${socket.data.userId}`)

    // 加入用户专属房间
    socket.join(`user:${socket.data.userId}`)

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${socket.data.userId}`)
    })
  })

  return io
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

export function notifyUser(userId: string, event: string, data: unknown) {
  try {
    getIO().to(`user:${userId}`).emit(event, data)
  } catch (err) {
    console.error('Socket notify error:', (err as Error).message)
  }
}
