import type { ApiResult } from '../types/api.types'

export interface ApiRequestPayload {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  body?: unknown
}

export type Message =
  | { type: 'PING' }
  | { type: 'API_REQUEST'; payload: ApiRequestPayload }
  | { type: 'AUTH_LOGIN'; email: string; password: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_STATUS' }
  | { type: 'DETECT_RESULT'; payload: { url: string } }

export type MessageResponse =
  | { type: 'PONG'; url: string }
  | { type: 'API_RESPONSE'; result: ApiResult<unknown> }
  | { type: 'AUTH_RESULT'; authenticated: boolean; error?: string }
  | { type: 'ERROR'; error: string }
