import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Player, PairingRequest, PlayerCommand } from '@signage/types'

export function usePlayers(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['players', workspaceId],
    queryFn: () => api.players.list(workspaceId!),
    enabled: !!workspaceId,
  })
}

export function usePlayer(workspaceId: string, playerId: string) {
  return useQuery({
    queryKey: ['players', workspaceId, playerId],
    queryFn: () => api.players.get(workspaceId, playerId),
    enabled: !!workspaceId && !!playerId,
  })
}

export function usePairPlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: PairingRequest }) =>
      api.players.pair(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players', variables.workspaceId] })
    },
  })
}

export function useAssignChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      playerId,
      channelId,
    }: {
      workspaceId: string
      playerId: string
      channelId: string | null
    }) => api.players.assignChannel(workspaceId, playerId, channelId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['players', variables.workspaceId, variables.playerId] })
    },
  })
}

export function useSendCommand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      playerId,
      command,
    }: {
      workspaceId: string
      playerId: string
      command: { type: string; params?: Record<string, unknown> }
    }) => api.players.sendCommand(workspaceId, playerId, command),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players', variables.workspaceId, variables.playerId, 'commands'] })
    },
  })
}

export function usePlayerCommands(workspaceId: string, playerId: string) {
  return useQuery({
    queryKey: ['players', workspaceId, playerId, 'commands'],
    queryFn: () => api.players.listCommands(workspaceId, playerId),
    enabled: !!workspaceId && !!playerId,
  })
}

export function useRequestScreenshot() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, playerId }: { workspaceId: string; playerId: string }) =>
      api.players.requestScreenshot(workspaceId, playerId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players', variables.workspaceId, variables.playerId] })
    },
  })
}

export function useCreatePlayer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      data
    }: {
      workspaceId: string
      data: { name: string; device_type?: string }
    }) => api.players.create(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['players', variables.workspaceId] })
    },
  })
}

export function useRequestPairingCode() {
  return useQuery({
    queryKey: ['pairing-code'],
    queryFn: () => api.players.requestPairingCode(),
    staleTime: 0, // Always fetch fresh
    refetchInterval: 60000, // Refresh every minute
  })
}
