import { describe, it, expect } from 'vitest'
import { mergeFieldsWithResults } from './merge-fields-with-results'
import type { DetectedField } from '../types/field.types'
import type { GenerateFieldResult } from '../types/generation.types'

function field(overrides: Partial<DetectedField> = {}): DetectedField {
  return {
    id: 'field-0',
    kind: 'text',
    label: 'Name',
    required: false,
    selectorRef: 'field-0',
    ...overrides,
  }
}

describe('mergeFieldsWithResults', () => {
  it('joins a field with its matching result and defaults reviewStatus to pending', () => {
    const fields = [field({ id: 'q1' })]
    const results: GenerateFieldResult[] = [
      { fieldId: 'q1', answer: 'Hi', confidence: 'high', assumptions: [], cached: false },
    ]

    const merged = mergeFieldsWithResults(fields, results)

    expect(merged).toEqual([
      { ...fields[0], answer: 'Hi', confidence: 'high', assumptions: [], reviewStatus: 'pending' },
    ])
  })

  it('drops fields the backend returned no result for', () => {
    const fields = [field({ id: 'q1' }), field({ id: 'q2' })]
    const results: GenerateFieldResult[] = [
      { fieldId: 'q1', answer: 'Hi', confidence: 'high', assumptions: [], cached: false },
    ]

    const merged = mergeFieldsWithResults(fields, results)

    expect(merged).toHaveLength(1)
    expect(merged[0]?.id).toBe('q1')
  })

  it('preserves field order', () => {
    const fields = [field({ id: 'a' }), field({ id: 'b' }), field({ id: 'c' })]
    const results: GenerateFieldResult[] = ['a', 'b', 'c'].map((id) => ({
      fieldId: id,
      answer: id,
      confidence: 'high',
      assumptions: [],
      cached: false,
    }))

    const merged = mergeFieldsWithResults(fields, results)

    expect(merged.map((f) => f.id)).toEqual(['a', 'b', 'c'])
  })
})
