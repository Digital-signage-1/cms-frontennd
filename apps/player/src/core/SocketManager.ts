import { io, Socket } from 'socket.io-client'

const API_BASE_URL = (import.meta.env?.VITE_API_URL as string) || 'http://localhost:8080'
// Socket.IO connects to the server root, not the /api/v1 prefix
const WS_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '')

export class SocketManager {
  private static instance: SocketManager
  private socket: Socket | null = null

  onCommand: ((cmd: any) => void) | null = null
  onChannelUpdate: ((data: any) => void) | null = null
  onStatusChange: ((connected: boolean) => void) | null = null

  private constructor() {}

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager()
    }
    return SocketManager.instance
  }

  connect(playerId: string, deviceToken: string): void {
    if (this.socket?.connected) return

    this.socket = io(WS_URL, {
      auth: {
        type: 'player',
        player_id: playerId,
        device_token: deviceToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      reconnectionAttempts: Infinity,
    })

    this.socket.on('connect', () => {
      console.log('[Socket] Connected')
      this.onStatusChange?.(true)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      this.onStatusChange?.(false)
    })

    this.socket.on('command:execute', (data) => {
      console.log('[Socket] Command received:', data)
      this.onCommand?.(data)
    })

    this.socket.on('channel:updated', (data) => {
      console.log('[Socket] Channel updated')
      this.onChannelUpdate?.(data)
    })

    this.socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message)
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
  }

  emit(event: string, data?: any): void {
    this.socket?.emit(event, data)
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}
