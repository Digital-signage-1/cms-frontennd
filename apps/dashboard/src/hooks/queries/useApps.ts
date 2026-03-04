import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { App, AppType, AppConfig, AppTypesResponse, AppTypeSchemaResponse } from '@signage/types'

export function useApps(workspaceId: string | number) {
  const wid = Number(workspaceId)
  return useQuery({
    queryKey: ['apps', wid],
    queryFn: () => api.apps.list(wid),
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
        integration_id?: string
        config: AppConfig
      }
    }) => api.apps.create(Number(workspaceId), data),
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
      appId: string | number
      data: Partial<App>
    }) => api.apps.update(Number(workspaceId), Number(appId), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId, variables.appId] })
    },
  })
}

export function useDeleteApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ workspaceId, appId }: { workspaceId: string | number; appId: string | number }) =>
      api.apps.delete(Number(workspaceId), Number(appId)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
    },
  })
}
