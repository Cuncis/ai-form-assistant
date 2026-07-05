import { apiRequest } from '../../shared/api/http-client'
import { STORAGE_KEYS } from '../../shared/constants/storage-keys'
import { storageGet, storageRemove, storageSet } from '../../shared/storage/chrome-storage'
import type { Message, MessageResponse } from '../../shared/messages/message-types'

/** The service worker is the only context that ever reads/writes the raw auth token. */
export async function handleAuthRequest(message: Message): Promise<MessageResponse> {
  switch (message.type) {
    case 'AUTH_LOGIN': {
      const result = await apiRequest<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: message.email, password: message.password }),
      })
      if (!result.success) {
        return { type: 'AUTH_RESULT', authenticated: false, error: result.error }
      }
      await storageSet(STORAGE_KEYS.authToken, result.data.token)
      return { type: 'AUTH_RESULT', authenticated: true }
    }

    case 'AUTH_LOGOUT': {
      await apiRequest('/auth/logout', { method: 'POST' })
      await storageRemove(STORAGE_KEYS.authToken)
      return { type: 'AUTH_RESULT', authenticated: false }
    }

    case 'AUTH_STATUS': {
      const token = await storageGet<string>(STORAGE_KEYS.authToken)
      return { type: 'AUTH_RESULT', authenticated: Boolean(token) }
    }

    default:
      return { type: 'ERROR', error: 'handleAuthRequest received the wrong message type' }
  }
}
