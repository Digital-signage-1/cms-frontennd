import type { ApiClient } from '../client'
import type { App, AppType, AppConfig, AppTypesResponse, AppTypeSchemaResponse } from '@signage/types'

export function createAppsEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: string) =>
      client.get<App[]>(`/api/v1/workspaces/${workspaceId}/apps`),
    
    get: (workspaceId: string, appId: string) =>
      client.get<App>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`),
    
    create: (workspaceId: string, data: {
      template_type: string
      name: string
      description?: string
      content_id?: string
      integration_id?: string
      config: AppConfig
    }) => client.post<App>(`/api/v1/workspaces/${workspaceId}/apps`, data),
    
    update: (workspaceId: string, appId: string, data: Partial<App>) =>
      client.patch<App>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`, data),
    
    delete: (workspaceId: string, appId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`),
    
    getPreviewUrl: (workspaceId: string, appId: string) =>
      client.get<{ url: string }>(`/api/v1/workspaces/${workspaceId}/apps/${appId}/preview`),
    
    listAppTypes: (category?: string) =>
      client.get<AppTypesResponse>('/api/v1/app-types', { params: category ? { category } : undefined }),

    getAppType: (typeId: string) =>
      client.get<AppTypeSchemaResponse>(`/api/v1/app-types/${typeId}`),

    getAppTypeSchema: (typeId: string) =>
      client.get<AppTypeSchemaResponse>(`/api/v1/app-types/${typeId}/schema`),
  }
}
