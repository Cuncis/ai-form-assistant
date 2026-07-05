import { useMutation } from '@tanstack/react-query'
import { sendMessage } from '../messages/message-bus'

/**
 * Popup has no DOM access, so it can't detect fields or render a Review Panel itself — it just
 * asks the active tab's content script to run its own generate-and-review flow (same one the
 * in-page floating button and keyboard shortcut trigger).
 */
export function useRunGenerateOnPage() {
  return useMutation({
    mutationFn: async () => {
      const response = await sendMessage({ type: 'RUN_GENERATE_ON_PAGE' })
      if (response.type === 'TRIGGERED') return
      if (response.type === 'ERROR') throw new Error(response.error)
      throw new Error('Unexpected response from service worker')
    },
  })
}
