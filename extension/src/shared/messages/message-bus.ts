import type { ApiResult } from '../types/api.types'
import type { ApiRequestPayload, Message, MessageResponse } from './message-types'

/** Typed wrapper around chrome.runtime.sendMessage. Used by popup/options/content — never fetch() directly. */
export async function sendMessage(message: Message): Promise<MessageResponse> {
  return chrome.runtime.sendMessage(message)
}

/** Client-facing bridge to the backend — routes through the service worker, never fetches directly. */
export async function callApi<T>(
  method: ApiRequestPayload['method'],
  path: string,
  body?: unknown
): Promise<ApiResult<T>> {
  const response = await sendMessage({ type: 'API_REQUEST', payload: { method, path, body } })
  if (response.type === 'API_RESPONSE') return response.result as ApiResult<T>
  if (response.type === 'ERROR') return { success: false, error: response.error }
  return { success: false, error: 'Unexpected response from service worker' }
}

export type MessageHandler = (
  message: Message,
  sender: chrome.runtime.MessageSender
) => Promise<MessageResponse>

/** Registers a single typed listener in the service worker and keeps the response channel open. */
export function registerMessageHandler(handler: MessageHandler): void {
  chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
    handler(message, sender).then(sendResponse)
    return true
  })
}
