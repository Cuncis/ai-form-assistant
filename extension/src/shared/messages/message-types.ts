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
  // Popup asking background to relay the generate trigger to the active tab's content
  // script, which owns detection, the backend call, and rendering the Review Panel itself.
  | { type: 'RUN_GENERATE_ON_PAGE' }
  // background -> content relays (from the popup message above, or a keyboard command).
  | { type: 'TRIGGER_GENERATE' }
  | { type: 'FILL_ACCEPTED_REQUESTED' }
  | { type: 'OPEN_REVIEW_PANEL_REQUESTED' }

export type MessageResponse =
  | { type: 'PONG'; url: string }
  | { type: 'API_RESPONSE'; result: ApiResult<unknown> }
  | { type: 'AUTH_RESULT'; authenticated: boolean; error?: string }
  | { type: 'TRIGGERED' }
  | { type: 'ERROR'; error: string }
