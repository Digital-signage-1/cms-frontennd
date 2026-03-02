import type { ApiClient } from '../client'
import type { InvitationResponse, PendingInvitationResponse, AcceptInviteResponse } from '@signage/types'

export function createInvitationsEndpoints(client: ApiClient) {
  return {
    listPending: () => client.get<PendingInvitationResponse[]>('/api/v1/invitations/pending'),
    accept: (token: string) => client.post<AcceptInviteResponse>('/api/v1/invitations/accept', { token }),
    listByWorkspace: (workspaceId: number) =>
      client.get<InvitationResponse[]>(`/api/v1/workspaces/${workspaceId}/invitations`),
    revoke: (workspaceId: number, invitationId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}`),
    resend: (workspaceId: number, invitationId: number) =>
      client.post<InvitationResponse>(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}/resend`, {}),
  }
}
