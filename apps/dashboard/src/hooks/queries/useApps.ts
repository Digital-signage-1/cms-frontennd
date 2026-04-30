import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { App, AppType, AppConfig, AppTypesResponse, AppTypeSchemaResponse } from '@signage/types'

export function useApps(workspaceId: string | number, params?: { folder_id?: string }) {
  const wid = Number(workspaceId)
  return useQuery({
    queryKey: ['apps', wid, params],
    queryFn: () => api.apps.list(wid, params),
    enabled: !!wid,
  })
}

export function useApp(workspaceId: string | number, appId: string | number) {
  const wid = Number(workspaceId)
  const aid = Number(appId)
  return useQuery({
    queryKey: ['apps', wid, aid],
    queryFn: () => api.apps.get(wid, aid),
    enabled: !!wid && !Number.isNaN(aid),
  })
}

export function useAppTypes(category?: string) {
  return useQuery({
    queryKey: ['app-types', category],
    queryFn: () => api.apps.listAppTypes(category),
  })
}

export function useAppType(typeId: string) {
  return useQuery({
    queryKey: ['app-types', typeId],
    queryFn: () => api.apps.getAppType(typeId),
    enabled: !!typeId,
  })
}

export function useAppTypeSchema(typeId: string) {
  return useQuery({
    queryKey: ['app-type-schema', typeId],
    queryFn: () => api.apps.getAppTypeSchema(typeId),
    enabled: !!typeId,
  })
}

export function useCreateApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: number | string
      data: {
        template_type: string
        name: string
        description?: string
        content_id?: string
        folder_id?: string
        integration_id?: string
        config: AppConfig
      }
    }) => api.apps.create(workspaceId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
    },
  })
}

export function useUpdateApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      appId,
      data,
    }: {
      workspaceId: string | number
      appId: string
      data: Partial<App>
    }) => api.apps.update(workspaceId, appId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId, variables.appId] })
    },
  })
}

export function useDeleteApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, appId }: { workspaceId: string | number; appId: string }) =>
      api.apps.delete(workspaceId, appId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
    },
  })
}

export function useBulkDeleteApps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, appIds }: { workspaceId: string | number; appIds: string[] }) =>
      api.apps.bulkDelete(workspaceId, appIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['folders', variables.workspaceId] })
    },
  })
}

export function useBulkMoveApps() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, appIds, folderId }: { workspaceId: string | number; appIds: string[]; folderId: string | null }) =>
      api.apps.bulkMove(workspaceId, appIds, folderId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['folders', variables.workspaceId] })
    },
  })
}
