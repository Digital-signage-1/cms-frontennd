import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import type { LayoutTemplate, ScreenTemplate, TemplateCreateRequest, TemplateUsage } from '@signage/types'

// Layout Templates
export function useLayoutTemplates(workspaceId: string, params?: {
  category?: string
  orientation?: string
  is_public?: boolean
}) {
  return useQuery({
    queryKey: ['layout-templates', workspaceId, params],
    queryFn: () => api.templates.listLayoutTemplates(workspaceId, params),
    enabled: !!workspaceId,
  })
}

export function useLayoutTemplate(workspaceId: string, templateId: string) {
  return useQuery({
    queryKey: ['layout-templates', workspaceId, templateId],
    queryFn: () => api.templates.getLayoutTemplate(workspaceId, templateId),
    enabled: !!workspaceId && !!templateId,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['layout-templates', variables.workspaceId] })
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
      queryClient.invalidateQueries({ queryKey: ['layout-templates', variables.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['layout-templates', variables.workspaceId, variables.templateId] })
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['layout-templates', variables.workspaceId] })
    },
  })
}

// Screen Templates
export function useScreenTemplates(workspaceId: string, params?: {
  layout_template_id?: string
  industry?: string
  is_public?: boolean
}) {
  return useQuery({
    queryKey: ['screen-templates', workspaceId, params],
    queryFn: () => api.templates.listScreenTemplates(workspaceId, params),
    enabled: !!workspaceId,
  })
}

export function useScreenTemplate(workspaceId: string, templateId: string) {
  return useQuery({
    queryKey: ['screen-templates', workspaceId, templateId],
    queryFn: () => api.templates.getScreenTemplate(workspaceId, templateId),
    enabled: !!workspaceId && !!templateId,
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