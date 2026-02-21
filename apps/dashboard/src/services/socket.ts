import { io, Socket } from 'socket.io-client'
import { getAccessToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
// Socket.IO connects to the server root, not any API prefix
const WS_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

let socket: Socket | null = null

export function getSocket(): Socket | null {
  return socket
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket

  const token = getAccessToken()
  if (!token) {
    throw new Error('No access token available')
  }

  socket = io(WS_URL, {
    auth: {
      type: 'dashboard',
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    reconnectionAttempts: Infinity,
  })

  socket.on('connect', () => {
    console.log('[Socket] Dashboard connected')
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Dashboard disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message)
  })

  return socket
}

export function disconnectSocket(): void {
  socket?.disconnect()
  socket = null
}

export function joinWorkspace(workspaceId: string): void {
  socket?.emit('join_workspace', { workspace_id: workspaceId })
}
