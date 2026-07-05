import type { ConfidenceLevel } from '../../shared/types/field.types'

/** Backend already returns a model-reported confidence; this is the client-side fill gate. */
export function isFillable(confidence: ConfidenceLevel): boolean {
  return confidence === 'high'
}
