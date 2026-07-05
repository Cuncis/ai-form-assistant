import { config } from '../config/env'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { storageGet } from '../storage/chrome-storage'
import { getSettings } from '../storage/settings-store'
import type { ApiResult } from '../types/api.types'

/**
 * Only the service worker should import this — it's the sole network egress point for the
 * extension (see ARCHITECTURE.md §1/§5). Popup/content scripts reach it via message passing.
 */
export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<ApiResult<T>> {
  const [{ backendBaseUrl }, token] = await Promise.all([
    getSettings(),
    storageGet<string>(STORAGE_KEYS.authToken),
  ])

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${backendBaseUrl}/api/${config.apiVersion}${path}`, {
      ...init,
      headers,
    })
  } catch {
    return { success: false, error: 'Network error — is the backend reachable?', code: 'network_error' }
  }

  const body: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorBody = body as { error?: string } | null
    return {
      success: false,
      error: errorBody?.error ?? response.statusText,
      code: String(response.status),
    }
  }

  const successBody = body as { data?: T } | null
  return { success: true, data: (successBody?.data ?? body) as T }
}
