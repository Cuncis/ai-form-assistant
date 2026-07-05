import type { DetectedField, GeneratedField } from '../types/field.types'
import type { GenerateFieldResult } from '../types/generation.types'

export function mergeFieldsWithResults(fields: DetectedField[], results: GenerateFieldResult[]): GeneratedField[] {
  const resultsByFieldId = new Map(results.map((result) => [result.fieldId, result]))

  return fields.flatMap((field) => {
    const result = resultsByFieldId.get(field.id)
    if (!result) return []

    return [
      {
        ...field,
        answer: result.answer,
        confidence: result.confidence,
        assumptions: result.assumptions,
        reviewStatus: 'pending' as const,
      },
    ]
  })
}
