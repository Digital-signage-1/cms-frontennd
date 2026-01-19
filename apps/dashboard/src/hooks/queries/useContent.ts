import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { Content, Folder, ContentListParams, ContentUploadRequest } from '@signage/types'

export function useContent(workspaceId: string, params?: ContentListParams) {
  return useQuery({
    queryKey: ['content', workspaceId, params],
    queryFn: () => api.content.list(workspaceId, params),
    enabled: !!workspaceId,
  })
}

export function useContentItem(
  workspaceId: string, 
  contentId: string,
  options?: Omit<UseQueryOptions<Content>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['content', workspaceId, contentId],
    queryFn: () => api.content.get(workspaceId, contentId),
    enabled: !!workspaceId && !!contentId && (options?.enabled !== false),
    ...options,
  })
}

export function useFolders(workspaceId: string, parentId?: string | null) {
  return useQuery({
    queryKey: ['folders', workspaceId, parentId],
    queryFn: () => api.content.listFolders(workspaceId, parentId),
    enabled: !!workspaceId,
  })
}

export function useAllFolders(workspaceId: string) {
  return useQuery({
    queryKey: ['folders', workspaceId, 'all'],
    queryFn: () => api.content.listFolders(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useUploadContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: ContentUploadRequest }) => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required')
      }
      return api.content.initiateUpload(workspaceId, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content', variables.workspaceId] })
    },
  })
}

export function useConfirmUpload() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, contentId }: { workspaceId: string; contentId: string }) => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required')
      }
      return api.content.confirmUpload(workspaceId, contentId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content', variables.workspaceId] })
    },
  })
}

export function useDeleteContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, contentId }: { workspaceId: string; contentId: string }) => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required')
      }
      return api.content.delete(workspaceId, contentId)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content', variables.workspaceId] })
    },
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: { name: string; parent_id?: string } }) => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required')
      }
      return api.content.createFolder(workspaceId, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.workspaceId] })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, folderId }: { workspaceId: string; folderId: string }) =>
      api.content.deleteFolder(workspaceId, folderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['folders', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['content', variables.workspaceId] })
    },
  })
}

export function useTags(workspaceId: string) {
  return useQuery({
    queryKey: ['tags', workspaceId],
    queryFn: () => api.content.listTags(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, data }: { workspaceId: string; data: { name: string; color: string } }) =>
      api.content.createTag(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tags', variables.workspaceId] })
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, tagId }: { workspaceId: string; tagId: string }) =>
      api.content.deleteTag(workspaceId, tagId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tags', variables.workspaceId] })
    },
  })
}
