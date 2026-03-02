import type { ApiClient } from '../client'
import type { LayoutTemplate, ScreenTemplate, TemplateCreateRequest, Channel } from '@signage/types'

export function createTemplatesEndpoints(client: ApiClient) {
  return {
    listLayoutTemplates: (params?: {
      category?: string
      orientation?: string
    }) => client.get<LayoutTemplate[]>(`/api/v1/layout-templates`, { params }),

    getLayoutTemplate: (templateId: number) =>
      client.get<LayoutTemplate>(`/api/v1/layout-templates/${templateId}`),

    createLayoutTemplate: (workspaceId: number, data: TemplateCreateRequest) =>
      client.post<LayoutTemplate>(`/api/v1/workspaces/${workspaceId}/layout-templates`, data),

    updateLayoutTemplate: (workspaceId: number, templateId: number, data: Partial<TemplateCreateRequest>) =>
      client.patch<LayoutTemplate>(`/api/v1/workspaces/${workspaceId}/layout-templates/${templateId}`, data),

    deleteLayoutTemplate: (workspaceId: number, templateId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/layout-templates/${templateId}`),

    listScreenTemplates: (params?: {
      industry?: string
      use_case?: string
      orientation?: string
      tags?: string
    }) => client.get<ScreenTemplate[]>(`/api/v1/screen-templates`, { params }),

    getScreenTemplate: (templateId: number) =>
      client.get<ScreenTemplate>(`/api/v1/screen-templates/${templateId}`),

    listIndustries: () =>
      client.get<{ industries: string[] }>(`/api/v1/screen-templates/industries`),

    listUseCases: (industry?: string) =>
      client.get<{ use_cases: string[] }>(`/api/v1/screen-templates/use-cases`, { params: industry ? { industry } : undefined }),

    createScreenTemplate: (workspaceId: number, data: {
      name: string
      layout_template_id: string
      industry?: string
      use_case?: string
      zones_snapshot: any[]
      theme?: Record<string, any>
      tags?: string[]
      is_public?: boolean
    }) => client.post<ScreenTemplate>(`/api/v1/workspaces/${workspaceId}/screen-templates`, data),

    updateScreenTemplate: (workspaceId: number, templateId: number, data: Partial<{
      name: string
      industry?: string
      use_case?: string
      zones_snapshot: any[]
      theme?: Record<string, any>
      tags?: string[]
      is_public?: boolean
    }>) => client.patch<ScreenTemplate>(`/api/v1/workspaces/${workspaceId}/screen-templates/${templateId}`, data),

    deleteScreenTemplate: (workspaceId: number, templateId: number) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/screen-templates/${templateId}`),

    createChannelFromTemplate: (workspaceId: number, data: { template_id: string; name: string; description?: string }) =>
      client.post<Channel>(`/api/v1/workspaces/${workspaceId}/channels/from-template`, data),

    saveChannelAsTemplate: (workspaceId: number, channelId: number, data: {
      name: string
      description?: string
      industry?: string
      use_case?: string
      tags?: string[]
      is_public?: boolean
    }) => client.post<ScreenTemplate>(`/api/v1/workspaces/${workspaceId}/channels/${channelId}/save-as-template`, data),
  }
}
