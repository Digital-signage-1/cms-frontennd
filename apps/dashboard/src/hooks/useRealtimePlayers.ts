import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'

const TOKEN_KEY = 'signage_access_token'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

function getSocketUrl(): string {
  try {
    const url = new URL(API_BASE_URL)
    return `${url.protocol}//${url.host}`
  } catch {
    return 'http://localhost:8080'
  }
}

export function useRealtimePlayers(workspaceId: number | undefined) {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return
    if (!workspaceId) return

    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    if (socketRef.current?.connected) return

    const socket = io(getSocketUrl(), {
      path: '/socket.io',
      auth: { type: 'dashboard', token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      socket.emit('join_workspace', { workspace_id: workspaceId })
    })

    socket.on('player:status', (data: { player_id: number; status: string }) => {
      queryClient.setQueryData(
        ['players', workspaceId],
        (old: any) => {
          if (!old) return old
          const list = Array.isArray(old) ? old : (old?.data ?? [])
          const updated = list.map((p: any) =>
            p.player_id === data.player_id || p.id === data.player_id
              ? { ...p, status: data.status }
              : p
          )
          return Array.isArray(old) ? updated : { ...old, data: updated }
        }
      )
    })

    socket.on('command:status', () => {
      queryClient.invalidateQueries({ queryKey: ['players', workspaceId] })
    })

    socket.on('channel:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['channels', workspaceId] })
    })

    socketRef.current = socket
  }, [workspaceId, queryClient])

  useEffect(() => {
    connect()
    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [connect])
}
