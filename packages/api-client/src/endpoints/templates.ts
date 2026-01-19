import type { ApiClient } from '../client'
import type { LayoutTemplate, ScreenTemplate, TemplateCreateRequest, TemplateUsage } from '@signage/types'

export function createTemplatesEndpoints(client: ApiClient) {
  return {
    // Layout Templates
    listLayoutTemplates: (workspaceId: string, params?: {
      category?: string
      orientation?: string
      is_public?: boolean
    }) => client.get<LayoutTemplate[]>(`/api/v1/workspaces/${workspaceId}/templates/layouts`, { params }),

    getLayoutTemplate: (workspaceId: string, templateId: string) =>
      client.get<LayoutTemplate>(`/api/v1/workspaces/${workspaceId}/templates/layouts/${templateId}`),

    createLayoutTemplate: (workspaceId: string, data: TemplateCreateRequest) =>
      client.post<LayoutTemplate>(`/api/v1/workspaces/${workspaceId}/templates/layouts`, data),

    updateLayoutTemplate: (workspaceId: string, templateId: string, data: Partial<TemplateCreateRequest>) =>
      client.patch<LayoutTemplate>(`/api/v1/workspaces/${workspaceId}/templates/layouts/${templateId}`, data),

    deleteLayoutTemplate: (workspaceId: string, templateId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/templates/layouts/${templateId}`),

    // Screen Templates
    listScreenTemplates: (workspaceId: string, params?: {
      layout_template_id?: string
      industry?: string
      is_public?: boolean
    }) => client.get<ScreenTemplate[]>(`/api/v1/workspaces/${workspaceId}/templates/screens`, { params }),

    getScreenTemplate: (workspaceId: string, templateId: string) =>
      client.get<ScreenTemplate>(`/api/v1/workspaces/${workspaceId}/templates/screens/${templateId}`),

    createScreenTemplate: (workspaceId: string, data: {
      name: string
      layout_template_id: string
      industry?: string
      use_case?: string
      zones_snapshot: any[]
      theme?: Record<string, any>
      is_public?: boolean
    }) => client.post<ScreenTemplate>(`/api/v1/workspaces/${workspaceId}/templates/screens`, data),

    // Template Usage
    getTemplateUsage: (workspaceId: string, templateId: string) =>
      client.get<TemplateUsage>(`/api/v1/workspaces/${workspaceId}/templates/${templateId}/usage`),
  }
}