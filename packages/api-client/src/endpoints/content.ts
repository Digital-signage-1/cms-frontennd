import type { ApiClient } from '../client'
import type { Content, Folder, Tag, ContentUploadRequest, ContentUploadResponse, ContentListParams } from '@signage/types'

export function createContentEndpoints(client: ApiClient) {
  return {
    list: (workspaceId: number | string, params?: ContentListParams) =>
      client.get<{ items: Content[]; total: number }>(`/api/v1/workspaces/${workspaceId}/content`, { params: params as Record<string, string | number | boolean | undefined> }),
    
    get: (workspaceId: number | string, contentId: number | string) =>
      client.get<Content>(`/api/v1/workspaces/${workspaceId}/content/${contentId}`),
    
    initiateUpload: (workspaceId: number | string, data: ContentUploadRequest) =>
      client.post<ContentUploadResponse>(`/api/v1/workspaces/${workspaceId}/content/upload`, data),
    
    confirmUpload: (workspaceId: number | string, contentId: number | string) =>
      client.post<Content>(`/api/v1/workspaces/${workspaceId}/content/${contentId}/confirm`),

    delete: (workspaceId: number | string, contentId: number | string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/content/${contentId}`),
    
    listFolders: (workspaceId: number | string, parentId?: string | null, folderType?: string) =>
      client.get<Folder[]>(`/api/v1/workspaces/${workspaceId}/folders`, { 
        params: { 
          parent_id: parentId || undefined,
          folder_type: folderType 
        } 
      }),
    
    createFolder: (workspaceId: number | string, data: { name: string; parent_id?: string; folder_type?: string }) =>
      client.post<Folder>(`/api/v1/workspaces/${workspaceId}/folders`, data),
    
    updateFolder: (workspaceId: number | string, folderId: number | string, data: { name: string }) =>
      client.patch<Folder>(`/api/v1/workspaces/${workspaceId}/folders/${folderId}`, data),
    
    deleteFolder: (workspaceId: number | string, folderId: number | string) =>
      client.delete<void>(`/api/v1/workspaces/${workspaceId}/folders/${folderId}`),
    
    listTags: (workspaceId: number | string) =>
      client.get<Tag[]>(`/api/v1/workspaces/${workspaceId}/tags`),
    
    createTag: (workspaceId: number | string, data: { name: string; color: string }) =>
      client.post<Tag>(`/api/v1/workspaces/${workspaceId}/tags`, data),
    
    deleteTag: (workspaceId: number | string, tagId: number | string) =>
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
    
    getDisplayResolutions: () =>
      client.get<Array<{ resolution: string; width: number; height: number; label?: string }>>('/api/v1/content/display-resolutions'),
  }
}
