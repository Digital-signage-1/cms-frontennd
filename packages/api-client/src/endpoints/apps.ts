import type { ApiClient } from '../client'
import type { App, AppType, AppConfig, AppTypesResponse, AppTypeSchemaResponse } from '@signage/types'

export function createAppsEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: number | string, params?: { folder_id?: string }) =>
      client.get<App[]>(`/api/v1/workspaces/${workspaceId}/apps`, { params }),
    
    get: (workspaceId: number, appId: number) =>
      client.get<App>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`),
    
    create: (workspaceId: number | string, data: { 
      name: string; 
      template_type: string; 
      content_id?: string;
      folder_id?: string;
      integration_id?: string;
      config?: Record<string, any> 
    }) =>
      client.post<App>(`/api/v1/workspaces/${workspaceId}/apps`, data),
    
    update: (workspaceId: number | string, appId: string, data: { 
      name?: string; 
      status?: string; 
      folder_id?: string;
      config?: Record<string, any> 
    }) =>
      client.patch<App>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`, data),
    
    delete: (workspaceId: number | string, appId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/apps/${appId}`),

    bulkDelete: (workspaceId: number | string, appIds: string[]) =>
      client.post<{ success: boolean; count: number }>(`/api/v1/workspaces/${workspaceId}/apps/bulk-delete`, { app_ids: appIds }),

    bulkMove: (workspaceId: number | string, appIds: string[], folderId: string | null) =>
      client.post<{ success: boolean; count: number }>(`/api/v1/workspaces/${workspaceId}/apps/bulk-move`, { app_ids: appIds, folder_id: folderId }),

    listAppTypes: (category?: string) =>
      client.get<AppTypesResponse>('/api/v1/app-types', { params: category ? { category } : undefined }),

    getAppType: (typeId: string) =>
      client.get<AppTypeSchemaResponse>(`/api/v1/app-types/${typeId}`),

    getAppTypeSchema: (typeId: string) =>
      client.get<AppTypeSchemaResponse>(`/api/v1/app-types/${typeId}/schema`),
  }
}
