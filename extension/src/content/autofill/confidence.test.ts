import { describe, it, expect } from 'vitest'
import { isFillable } from './confidence'

describe('isFillable', () => {
  it('only high confidence is auto-fillable', () => {
    expect(isFillable('high')).toBe(true)
    expect(isFillable('medium')).toBe(false)
    expect(isFillable('low')).toBe(false)
  })
})
