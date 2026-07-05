import type { ApiResult } from '../types/api.types'
import type { DetectedField } from '../types/field.types'
import type { GenerateFieldResult, PageContext } from '../types/generation.types'

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
  | { type: 'DETECT_FIELDS' }
  | { type: 'FILL_FIELD'; fieldId: string; value: string }
  | { type: 'GENERATE_ANSWERS'; profileId: string; templateId: string }
  // Keyboard-shortcut relays for features that don't exist yet — Phase 7 (Review UI).
  | { type: 'FILL_ACCEPTED_REQUESTED' }
  | { type: 'OPEN_REVIEW_PANEL_REQUESTED' }

export type MessageResponse =
  | { type: 'PONG'; url: string }
  | { type: 'API_RESPONSE'; result: ApiResult<unknown> }
  | { type: 'AUTH_RESULT'; authenticated: boolean; error?: string }
  | { type: 'DETECT_FIELDS_RESULT'; fields: DetectedField[]; pageContext: PageContext }
  | { type: 'FILL_FIELD_RESULT'; success: boolean }
  | { type: 'GENERATE_ANSWERS_RESULT'; results: GenerateFieldResult[]; fields: DetectedField[] }
  | { type: 'ERROR'; error: string }
