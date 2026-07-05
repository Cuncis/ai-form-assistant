import type { DetectedField } from '../../shared/types/field.types'
import type { PageContext } from '../../shared/types/generation.types'

export interface SiteAdapter {
  readonly id: string
  matches(url: URL): boolean
  detectFields(): Promise<DetectedField[]>
  onFieldsChanged(callback: (fields: DetectedField[]) => void): () => void
  fillField(field: DetectedField, value: string): Promise<boolean>
  extractContext(): PageContext
}

/** Shared MutationObserver/debounce plumbing. Subclasses override only what differs per site. */
export abstract class BaseAdapter implements SiteAdapter {
  abstract readonly id: string
  abstract matches(url: URL): boolean

  async detectFields(): Promise<DetectedField[]> {
    throw new Error(`Not implemented — Phase 6 (${this.id})`)
  }

  onFieldsChanged(_callback: (fields: DetectedField[]) => void): () => void {
    throw new Error(`Not implemented — Phase 6 (${this.id})`)
  }

  async fillField(_field: DetectedField, _value: string): Promise<boolean> {
    throw new Error(`Not implemented — Phase 6 (${this.id})`)
  }

  extractContext(): PageContext {
    throw new Error(`Not implemented — Phase 6 (${this.id})`)
  }
}
