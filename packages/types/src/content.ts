export type ContentType = 'image' | 'video' | 'pdf' | 'audio' | 'document'

export type ContentStatus = 'uploading' | 'processing' | 'ready' | 'error'

export interface Content {
  content_id: string
  workspace_id: string
  folder_id?: string
  name: string
  type: ContentType
  mime_type: string
  s3_key: string
  thumbnail_key?: string
  size_bytes: number
  duration_seconds?: number
  width?: number
  height?: number
  status: ContentStatus
  uploaded_by: string
  metadata?: ContentMetadata
  url?: string
  thumbnail_url?: string
  created_at: string
  updated_at?: string
}

export interface ContentMetadata {
  original_filename?: string
  encoding?: string
  bitrate?: number
  framerate?: number
  codec?: string
  [key: string]: unknown
}

export interface Folder {
  folder_id: string
  workspace_id: string
  parent_id?: string
  name: string
  path: string
  depth: number
  content_count: number
  created_at: string
}

export interface Tag {
  tag_id: string
  workspace_id: string
  name: string
  color: string
  usage_count: number
}

export interface ContentUploadRequest {
  name: string
  mime_type: string
  size_bytes: number
  folder_id?: string
}

export interface ContentUploadResponse {
  content_id: string
  upload_url: string
  s3_key: string
  expires_in: number
}

export interface ContentListParams {
  folder_id?: string
  type?: ContentType
  status?: ContentStatus
  search?: string
  tags?: string[]
  page?: number
  limit?: number
  sort_by?: 'name' | 'created_at' | 'size_bytes' | 'type'
  sort_order?: 'asc' | 'desc'
}
