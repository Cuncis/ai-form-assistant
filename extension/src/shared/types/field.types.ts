export type FieldKind =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'email'
  | 'phone'
  | 'file'
  | 'rich-text'
  | 'contenteditable'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

/** 'fill-failed': user accepted, but the DOM write itself failed (e.g. a <select> with no
 * matching option) — distinct from 'pending' so the UI doesn't imply nothing happened. */
export type FieldReviewStatus = 'pending' | 'accepted' | 'edited' | 'rejected' | 'fill-failed'

export interface FieldOption {
  value: string
  label: string
}

/** A form field as detected on the page by a SiteAdapter, before any AI answer exists. */
export interface DetectedField {
  id: string
  kind: FieldKind
  label: string
  placeholder?: string
  ariaLabel?: string
  name?: string
  required: boolean
  options?: FieldOption[]
  currentValue?: string
  /** Opaque handle a SiteAdapter uses to locate the live DOM node again at fill time. */
  selectorRef: string
  frameId?: number
}

/** A field once the backend has produced an answer for it. */
export interface GeneratedField extends DetectedField {
  answer: string
  confidence: ConfidenceLevel
  assumptions: string[]
  reviewStatus: FieldReviewStatus
}
