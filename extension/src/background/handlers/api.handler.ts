import { apiRequest } from '../../shared/api/http-client'
import type { Message, MessageResponse } from '../../shared/messages/message-types'

/** Generic bridge: every backend-bound request from popup/options/content lands here. */
export async function handleApiRequest(message: Message): Promise<MessageResponse> {
  if (message.type !== 'API_REQUEST') {
    return { type: 'ERROR', error: 'handleApiRequest received the wrong message type' }
  }

  const { method, path, body } = message.payload
  const result = await apiRequest(path, {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  return { type: 'API_RESPONSE', result }
}
