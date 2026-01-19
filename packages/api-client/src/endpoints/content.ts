import type { ApiClient } from '../client'
import type { Content, Folder, Tag, ContentUploadRequest, ContentUploadResponse, ContentListParams } from '@signage/types'

export function createContentEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: string, params?: ContentListParams) =>
      client.get<{ items: Content[]; total: number }>(`/api/v1/workspaces/${workspaceId}/content`, { params: params as Record<string, string | number | boolean | undefined> }),
    
    get: (workspaceId: string, contentId: string) =>
      client.get<Content>(`/api/v1/workspaces/${workspaceId}/content/${contentId}`),
    
    initiateUpload: (workspaceId: string, data: ContentUploadRequest) =>
      client.post<ContentUploadResponse>(`/api/v1/workspaces/${workspaceId}/content/upload`, data),
    
    confirmUpload: (workspaceId: string, contentId: string) =>
      client.post<Content>(`/api/v1/workspaces/${workspaceId}/content/${contentId}/confirm`),
    
    update: (workspaceId: string, contentId: string, data: Partial<Content>) =>
      client.patch<Content>(`/api/v1/workspaces/${workspaceId}/content/${contentId}`, data),
    
    delete: (workspaceId: string, contentId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/content/${contentId}`),
    
    listFolders: (workspaceId: string, parentId?: string | null) =>
      client.get<Folder[]>(`/api/v1/workspaces/${workspaceId}/folders`, { 
        params: parentId !== undefined ? { parent_id: parentId || undefined } : undefined 
      }),
    
    createFolder: (workspaceId: string, data: { name: string; parent_id?: string }) =>
      client.post<Folder>(`/api/v1/workspaces/${workspaceId}/folders`, data),
    
    deleteFolder: (workspaceId: string, folderId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/folders/${folderId}`),
    
    listTags: (workspaceId: string) =>
      client.get<Tag[]>(`/api/v1/workspaces/${workspaceId}/tags`),
    
    createTag: (workspaceId: string, data: { name: string; color: string }) =>
      client.post<Tag>(`/api/v1/workspaces/${workspaceId}/tags`, data),
    
    deleteTag: (workspaceId: string, tagId: string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/tags/${tagId}`),
    
    checkQuality: (data: {
      content_type: string
      width: number
      height: number
      file_size_bytes: number
      mime_type: string
      duration_seconds?: number
      bitrate_kbps?: number
    }) => client.post<{
      status: string
      score: number
      warnings: string[]
      errors: string[]
      recommendations: string[]
    }>('/api/v1/content/quality-check', data),
    
    getQualityGuidelines: (display?: string) =>
      client.get<Array<{
        content_type: string
        display_resolution: string
        recommended_resolution: string
        minimum_resolution: string
        max_file_size: string
        preferred_formats: string[]
        tips: string[]
      }>>('/api/v1/content/quality-guidelines', { params: { display } }),
  }
}
