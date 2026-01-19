import type { ApiClient } from '../client'
import type { Workspace, WorkspaceMember } from '@signage/types'

export function createWorkspaceEndpoints(client: ApiClient) {
  return {
    list: () => client.get<Workspace[]>('/api/v1/workspaces'),
    
    get: (id: string) => client.get<Workspace>(`/api/v1/workspaces/${id}`),
    
    create: (data: { name: string; timezone?: string }) =>
      client.post<Workspace>('/api/v1/workspaces', data),
    
    update: (id: string, data: Partial<Workspace>) =>
      client.patch<Workspace>(`/api/v1/workspaces/${id}`, data),
    
    delete: (id: string) => client.delete<void>(`/api/v1/workspaces/${id}`),
    
    getMembers: (id: string) =>
      client.get<WorkspaceMember[]>(`/api/v1/workspaces/${id}/members`),
    
    inviteMember: (id: string, email: string, role: string) =>
      client.post<void>(`/api/v1/workspaces/${id}/invitations`, { email, role }),
  }
}
