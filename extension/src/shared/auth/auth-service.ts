import { sendMessage } from '../messages/message-bus'

export interface AuthOutcome {
  authenticated: boolean
  error?: string
}

/**
 * Client-facing auth API for popup/options. The raw token never leaves the service worker —
 * these calls only ever learn whether the user is authenticated, not the token itself.
 */
export async function login(email: string, password: string): Promise<AuthOutcome> {
  const response = await sendMessage({ type: 'AUTH_LOGIN', email, password })
  if (response.type === 'AUTH_RESULT') {
    return { authenticated: response.authenticated, error: response.error }
  }
  return { authenticated: false, error: 'Unexpected response from service worker' }
}

export async function logout(): Promise<void> {
  await sendMessage({ type: 'AUTH_LOGOUT' })
}

export async function getAuthStatus(): Promise<boolean> {
  const response = await sendMessage({ type: 'AUTH_STATUS' })
  return response.type === 'AUTH_RESULT' && response.authenticated
}
