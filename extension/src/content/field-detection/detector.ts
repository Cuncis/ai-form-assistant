import type { DetectedField } from '../../shared/types/field.types'

/** Heuristic scan (label/aria-label/placeholder/name/id/DOM hierarchy) — Phase 6. */
export function detectFields(_root: ParentNode = document): DetectedField[] {
  throw new Error('Not implemented — Phase 6')
}
