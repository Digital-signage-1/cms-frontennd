import type { ApiClient } from '../client'
import type { Workspace, WorkspaceMember } from '@signage/types'

export function createWorkspaceEndpoints(client: ApiClient) {
  return {
    list: () => client.get<Workspace[]>('/api/v1/workspaces'),
    get: (id: number) => client.get<Workspace>(`/api/v1/workspaces/${id}`),
    create: (data: { name: string; timezone?: string }) =>
      client.post<Workspace>('/api/v1/workspaces', data),
    update: (id: number, data: Partial<Workspace>) =>
      client.patch<Workspace>(`/api/v1/workspaces/${id}`, data),
    delete: (id: number) => client.delete<void>(`/api/v1/workspaces/${id}`),
    getMembers: (id: number) =>
      client.get<WorkspaceMember[]>(`/api/v1/workspaces/${id}/members`),
    inviteMember: (id: number, email: string, role: string) =>
      client.post<void>(`/api/v1/workspaces/${id}/invitations`, { email, role }),
    updateMemberRole: (id: number, userSub: string, role: string) =>
      client.patch<WorkspaceMember>(`/api/v1/workspaces/${id}/members/${userSub}`, { role }),
    removeMember: (id: number, userSub: string) =>
      client.delete<void>(`/api/v1/workspaces/${id}/members/${userSub}`),
  }
}
