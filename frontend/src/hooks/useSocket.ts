import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/useAuthStore'

export interface Notification {
  id: string
  message: string
  book?: any
  timestamp: Date
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connected, setConnected] = useState(false)
  const { token, isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:4000',
      {
        auth: { token },
        transports: ['websocket', 'polling'],
        path: '/socket.io',
      }
    )

    socket.on('connect', () => {
      console.log('Socket connected')
      setConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
      setConnected(false)
    })

    socket.on('book:created', (data) => {
      addNotification(data)
    })

    socket.on('book:statusChanged', (data) => {
      addNotification(data)
    })

    socket.on('book:deleted', (data) => {
      addNotification(data)
    })

    socket.on('book:coverUpdated', (data) => {
      addNotification(data)
    })

    socketRef.current = socket

    return () => {
      socket.disconnect()
    }
  }, [isAuthenticated, token])

  const addNotification = useCallback((data: any) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random()}`,
      message: data.message,
      book: data.book,
      timestamp: new Date(),
    }
    setNotifications((prev) => [...prev, notification])

    // 5 秒后自动消失
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const dismissAll = useCallback(() => {
    setNotifications([])
  }, [])

  return { notifications, connected, dismiss, dismissAll }
}
