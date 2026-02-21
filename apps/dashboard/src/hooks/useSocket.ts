'use client'

import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { connectSocket, disconnectSocket, joinWorkspace } from '@/services/socket'

export function useSocket() {
  const queryClient = useQueryClient()
  const workspace = useAuthStore((s) => s.workspace)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return

    try {
      const socket = connectSocket()
      initialized.current = true

      // Invalidate player list when a player status changes
      socket.on('player:status', () => {
        queryClient.invalidateQueries({ queryKey: ['players'] })
      })

      // Invalidate commands cache when a command is acknowledged
      socket.on('command:status', () => {
        queryClient.invalidateQueries({ queryKey: ['commands'] })
      })

      // Invalidate channels when one is updated
      socket.on('channel:updated', () => {
        queryClient.invalidateQueries({ queryKey: ['channels'] })
      })
    } catch {
      // No token yet — will retry on next render
    }

    return () => {
      disconnectSocket()
      initialized.current = false
    }
  }, [isAuthenticated, queryClient])

  // Join workspace room whenever the active workspace changes
  useEffect(() => {
    if (workspace?.workspace_id) {
      joinWorkspace(workspace.workspace_id)
    }
  }, [workspace?.workspace_id])
}
