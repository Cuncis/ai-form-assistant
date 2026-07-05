import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTemplate, deleteTemplate, fetchTemplates, updateTemplate } from '../api/endpoints'
import { unwrapApiResult } from '../utils/unwrap-api-result'
import type { TemplateDraft } from '../types/template.types'

const TEMPLATES_QUERY_KEY = ['templates']

export function useTemplates() {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY,
    queryFn: async () => unwrapApiResult(await fetchTemplates()),
  })
}

export function useCreateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (draft: TemplateDraft) => unwrapApiResult(await createTemplate(draft)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY }),
  })
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, draft }: { id: string; draft: Partial<TemplateDraft> }) =>
      unwrapApiResult(await updateTemplate(id, draft)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY }),
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => unwrapApiResult(await deleteTemplate(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY }),
  })
}
