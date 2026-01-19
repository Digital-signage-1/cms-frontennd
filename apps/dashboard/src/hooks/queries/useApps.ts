import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { App, AppType, AppConfig, AppTypesResponse, AppTypeSchemaResponse } from '@signage/types'

export function useApps(workspaceId: string) {
  return useQuery({
    queryKey: ['apps', workspaceId],
    queryFn: () => api.apps.list(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useApp(workspaceId: string, appId: string) {
  return useQuery({
    queryKey: ['apps', workspaceId, appId],
    queryFn: () => api.apps.get(workspaceId, appId),
    enabled: !!workspaceId && !!appId,
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
      workspaceId: string
      data: {
        template_type: string
        name: string
        description?: string
        content_id?: string
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
      workspaceId: string
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
    mutationFn: ({ workspaceId, appId }: { workspaceId: string; appId: string }) =>
      api.apps.delete(workspaceId, appId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['apps', variables.workspaceId] })
    },
  })
}
