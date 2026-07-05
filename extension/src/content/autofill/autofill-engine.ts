import type { GeneratedField } from '../../shared/types/field.types'
import type { SiteAdapter } from '../site-adapters/base-adapter'

/**
 * Orchestrates detect -> generate -> review -> fill. Never touches a submit control —
 * that invariant lives here and must not be relaxed by any future change. Only fields the
 * user has explicitly accepted or edited are ever written into the page.
 */
export async function fillAcceptedFields(adapter: SiteAdapter, fields: GeneratedField[]): Promise<void> {
  const approved = fields.filter((field) => field.reviewStatus === 'accepted' || field.reviewStatus === 'edited')

  for (const field of approved) {
    try {
      const filled = await adapter.fillField(field, field.answer)
      if (!filled) {
        console.warn(`[AI Form Assistant] Could not locate field to fill: "${field.label}"`)
      }
    } catch (error) {
      console.warn(`[AI Form Assistant] Failed to fill field "${field.label}"`, error)
    }
  }
}
