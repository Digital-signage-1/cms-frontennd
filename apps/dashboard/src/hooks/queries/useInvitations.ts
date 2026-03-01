import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'

export function useWorkspaceInvitations(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['invitations', workspaceId],
    queryFn: () => api.invitations.listByWorkspace(workspaceId!),
    enabled: !!workspaceId,
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
      workspaceId: string
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
      workspaceId: string
      invitationId: string
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
      workspaceId: string
      invitationId: string
    }) => api.invitations.resend(workspaceId, invitationId),
  })
}
