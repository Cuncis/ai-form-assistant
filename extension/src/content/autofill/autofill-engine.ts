import type { GeneratedField } from '../../shared/types/field.types'
import type { SiteAdapter } from '../site-adapters/base-adapter'

/**
 * Orchestrates detect -> generate -> review -> fill. Never touches a submit control —
 * that invariant lives here and must not be relaxed by any future change.
 */
export async function fillAcceptedFields(
  _adapter: SiteAdapter,
  _fields: GeneratedField[]
): Promise<void> {
  throw new Error('Not implemented — Phase 6')
}
