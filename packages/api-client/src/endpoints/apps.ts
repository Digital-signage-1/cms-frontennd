import type { ApiClient } from '../client'
import type { App, AppType, AppConfig, AppTypesResponse, AppTypeSchemaResponse } from '@signage/types'

export function createAppsEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: number) =>
      client.get<App[]>(`/api/v1/workspaces/${workspaceId}/apps`),
    
    get: (workspaceId: number, appId: number) =>
      client.get<App>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`),
    
    create: (workspaceId: number, data: {
      template_type: string
      name: string
      description?: string
      content_id?: string
      integration_id?: string
      config: AppConfig
    }) => client.post<App>(`/api/v1/workspaces/${workspaceId}/apps`, data),
    
    update: (workspaceId: number, appId: number, data: Partial<App>) =>
      client.patch<App>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`, data),
    
    delete: (workspaceId: number, appId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`),

    listAppTypes: (category?: string) =>
      client.get<AppTypesResponse>('/api/v1/app-types', { params: category ? { category } : undefined }),

    getAppType: (typeId: string) =>
      client.get<AppTypeSchemaResponse>(`/api/v1/app-types/${typeId}`),

    getAppTypeSchema: (typeId: string) =>
      client.get<AppTypeSchemaResponse>(`/api/v1/app-types/${typeId}/schema`),
  }
}
