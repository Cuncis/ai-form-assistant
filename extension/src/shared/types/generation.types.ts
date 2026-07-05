import type { ConfidenceLevel, FieldReviewStatus } from './field.types'

export interface PageContext {
  url: string
  title: string
  metaDescription?: string
  companyName?: string
  visibleText: string
  language: string
}

export interface GenerateFieldRequest {
  fieldId: string
  question: string
  fieldKind: string
  options?: string[]
}

export interface GenerateBatchRequest {
  profileId: string
  templateId: string
  pageContext: PageContext
  fields: GenerateFieldRequest[]
}

export interface GenerateFieldResult {
  fieldId: string
  answer: string
  confidence: ConfidenceLevel
  assumptions: string[]
  cached: boolean
}

/** A row of the "History" feature — mirrors the backend `generations` table. */
export interface GenerationRecord {
  id: string
  siteDomain: string
  pageUrl: string
  questionText: string
  answerText: string
  confidence: ConfidenceLevel
  profileId: string
  templateId: string
  status: FieldReviewStatus
  createdAt: string
}
