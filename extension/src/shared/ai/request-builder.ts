import type { DetectedField } from '../types/field.types'
import type { GenerateBatchRequest, PageContext } from '../types/generation.types'

/** Builds the structured request DTO sent to the backend. The backend owns actual prompt text. */
export function buildGenerateRequest(
  fields: DetectedField[],
  context: PageContext,
  profileId: string,
  templateId: string
): GenerateBatchRequest {
  return {
    profileId,
    templateId,
    pageContext: context,
    fields: fields.map((field) => ({
      fieldId: field.id,
      question: field.label || field.ariaLabel || field.placeholder || field.name || 'Untitled field',
      fieldKind: field.kind,
      options: field.options?.map((option) => option.label),
    })),
  }
}
