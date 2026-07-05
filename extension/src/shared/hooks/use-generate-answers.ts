import { useMutation } from '@tanstack/react-query'
import { sendMessage } from '../messages/message-bus'

export function useGenerateAnswers() {
  return useMutation({
    mutationFn: async ({ profileId, templateId }: { profileId: string; templateId: string }) => {
      const response = await sendMessage({ type: 'GENERATE_ANSWERS', profileId, templateId })
      if (response.type === 'GENERATE_ANSWERS_RESULT') return { results: response.results, fields: response.fields }
      if (response.type === 'ERROR') throw new Error(response.error)
      throw new Error('Unexpected response from service worker')
    },
  })
}

export function useFillField() {
  return useMutation({
    mutationFn: async ({ fieldId, value }: { fieldId: string; value: string }) => {
      const response = await sendMessage({ type: 'FILL_FIELD', fieldId, value })
      if (response.type === 'FILL_FIELD_RESULT') return response.success
      if (response.type === 'ERROR') throw new Error(response.error)
      throw new Error('Unexpected response from service worker')
    },
  })
}
