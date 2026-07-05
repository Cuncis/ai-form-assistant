import type { ConfidenceLevel } from '../../shared/types/field.types'

/** Backend already returns a model-reported confidence; this applies extra client-side sanity checks. */
export function isFillable(_confidence: ConfidenceLevel): boolean {
  throw new Error('Not implemented — Phase 6')
}
