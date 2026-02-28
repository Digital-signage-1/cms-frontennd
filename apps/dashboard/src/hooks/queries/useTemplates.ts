import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { LayoutTemplate, ScreenTemplate, TemplateCreateRequest, TemplateUsage } from '@signage/types'

// Layout Templates
export function useLayoutTemplates(params?: {
  category?: string
  orientation?: string
}) {
  return useQuery({
    queryKey: ['layout-templates', params],
    queryFn: () => api.templates.listLayoutTemplates(params),
  })
}

export function useLayoutTemplate(templateId: string) {
  return useQuery({
    queryKey: ['layout-templates', templateId],
    queryFn: () => api.templates.getLayoutTemplate(templateId),
    enabled: !!templateId,
  })
}

export function useCreateLayoutTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      data,
    }: {
      workspaceId: string
      data: TemplateCreateRequest
    }) => api.templates.createLayoutTemplate(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layout-templates'] })
    },
  })
}

export function useUpdateLayoutTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      templateId,
      data,
    }: {
      workspaceId: string
      templateId: string
      data: Partial<TemplateCreateRequest>
    }) => api.templates.updateLayoutTemplate(workspaceId, templateId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['layout-templates'] })
      queryClient.invalidateQueries({ queryKey: ['layout-templates', variables.templateId] })
    },
  })
}

export function useDeleteLayoutTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      workspaceId,
      templateId,
    }: {
      workspaceId: string
      templateId: string
    }) => api.templates.deleteLayoutTemplate(workspaceId, templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['layout-templates'] })
    },
  })
}

// Screen Templates
export function useScreenTemplates(params?: {
  industry?: string
  use_case?: string
  orientation?: string
  tags?: string
}) {
  return useQuery({
    queryKey: ['screen-templates', params],
    queryFn: () => api.templates.listScreenTemplates(params),
  })
}

export function useScreenTemplate(templateId: string) {
  return useQuery({
    queryKey: ['screen-templates', templateId],
    queryFn: () => api.templates.getScreenTemplate(templateId),
    enabled: !!templateId,
  })
}

// Template Usage
export function useTemplateUsage(workspaceId: string, templateId: string) {
  return useQuery({
    queryKey: ['template-usage', workspaceId, templateId],
    queryFn: () => api.templates.getTemplateUsage(workspaceId, templateId),
    enabled: !!workspaceId && !!templateId,
  })
}