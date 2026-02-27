import type { ApiClient } from '../client'
import type { InvitationResponse, PendingInvitationResponse, AcceptInviteResponse } from '@signage/types'

export function createInvitationsEndpoints(client: ApiClient) {
  return {
    listPending: () => client.get<PendingInvitationResponse[]>('/api/v1/invitations/pending'),
    accept: (token: string) => client.post<AcceptInviteResponse>('/api/v1/invitations/accept', { token }),
    listByWorkspace: (workspaceId: string) =>
      client.get<InvitationResponse[]>(`/api/v1/workspaces/${workspaceId}/invitations`),
    revoke: (workspaceId: string, invitationId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}`),
    resend: (workspaceId: string, invitationId: string) =>
      client.post<InvitationResponse>(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}/resend`, {}),
  }
}
