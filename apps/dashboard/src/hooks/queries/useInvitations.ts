import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'

export function useWorkspaceInvitations(workspaceId: number | undefined) {
  return useQuery({
    queryKey: ['invitations', workspaceId],
    queryFn: () => api.invitations.listByWorkspace(workspaceId!),
    enabled: !!workspaceId && workspaceId > 0,
  })
}

export function useSendInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      email,
      role,
    }: {
      workspaceId: number
      email: string
      role: string
    }) => api.workspaces.inviteMember(workspaceId, email, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.workspaceId] })
    },
  })
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      invitationId,
    }: {
      workspaceId: number
      invitationId: number
    }) => api.invitations.revoke(workspaceId, invitationId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invitations', variables.workspaceId] })
    },
  })
}

export function useResendInvitation() {
  return useMutation({
    mutationFn: ({
      workspaceId,
      invitationId,
    }: {
      workspaceId: number
      invitationId: number
    }) => api.invitations.resend(workspaceId, invitationId),
  })
}
