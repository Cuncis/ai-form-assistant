import type { DetectedField } from '../types/field.types'
import type { GenerateBatchRequest, PageContext } from '../types/generation.types'

/** Builds the structured request DTO sent to the backend. The backend owns actual prompt text. */
export function buildGenerateRequest(
  _fields: DetectedField[],
  _context: PageContext,
  _profileId: string,
  _templateId: string
): GenerateBatchRequest {
  throw new Error('Not implemented — Phase 6')
}
