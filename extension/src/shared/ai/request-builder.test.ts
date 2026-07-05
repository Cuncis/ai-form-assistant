import { describe, it, expect } from 'vitest'
import { buildGenerateRequest } from './request-builder'
import type { DetectedField } from '../types/field.types'
import type { PageContext } from '../types/generation.types'

const context: PageContext = {
  url: 'https://boards.greenhouse.io/acme/jobs/1',
  title: 'Senior Engineer',
  visibleText: 'hiring',
  language: 'en',
}

describe('buildGenerateRequest', () => {
  it('maps detected fields to the API request shape', () => {
    const fields: DetectedField[] = [
      { id: 'q1', kind: 'text', label: 'Full name', required: true, selectorRef: 'q1' },
      {
        id: 'q2',
        kind: 'select',
        label: 'Topic',
        required: false,
        selectorRef: 'q2',
        options: [{ value: 'sales', label: 'Sales' }, { value: 'support', label: 'Support' }],
      },
    ]

    const request = buildGenerateRequest(fields, context, '1', '2')

    expect(request).toEqual({
      profileId: '1',
      templateId: '2',
      pageContext: context,
      fields: [
        { fieldId: 'q1', question: 'Full name', fieldKind: 'text', options: undefined },
        { fieldId: 'q2', question: 'Topic', fieldKind: 'select', options: ['Sales', 'Support'] },
      ],
    })
  })

  it('falls back through ariaLabel, placeholder, and name when label is empty', () => {
    const fields: DetectedField[] = [
      { id: 'q1', kind: 'text', label: '', ariaLabel: 'Aria label', required: false, selectorRef: 'q1' },
      { id: 'q2', kind: 'text', label: '', placeholder: 'Placeholder text', required: false, selectorRef: 'q2' },
      { id: 'q3', kind: 'text', label: '', name: 'field_name', required: false, selectorRef: 'q3' },
      { id: 'q4', kind: 'text', label: '', required: false, selectorRef: 'q4' },
    ]

    const request = buildGenerateRequest(fields, context, '1', '2')

    expect(request.fields.map((f) => f.question)).toEqual([
      'Aria label',
      'Placeholder text',
      'field_name',
      'Untitled field',
    ])
  })
})
