import type { GeneratedField } from '../../shared/types/field.types'
import type { SiteAdapter } from '../site-adapters/base-adapter'

/**
 * Orchestrates detect -> generate -> review -> fill. Never touches a submit control —
 * that invariant lives here and must not be relaxed by any future change. Only fields the
 * user has explicitly accepted or edited are ever written into the page.
 *
 * @returns the ids of fields that were actually written into the page — callers must not
 * report a field as "filled" just because the user clicked Accept; the underlying DOM write
 * can still fail (e.g. a <select> whose options don't match the generated value).
 */
export async function fillAcceptedFields(adapter: SiteAdapter, fields: GeneratedField[]): Promise<Set<string>> {
  const approved = fields.filter((field) => field.reviewStatus === 'accepted' || field.reviewStatus === 'edited')
  const filledIds = new Set<string>()

  for (const field of approved) {
    try {
      const filled = await adapter.fillField(field, field.answer)
      if (filled) {
        filledIds.add(field.id)
      } else {
        console.warn(`[AI Form Assistant] Could not locate field to fill: "${field.label}"`)
      }
    } catch (error) {
      console.warn(`[AI Form Assistant] Failed to fill field "${field.label}"`, error)
    }
  }

  return filledIds
}
