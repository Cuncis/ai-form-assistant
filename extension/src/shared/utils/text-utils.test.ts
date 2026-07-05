import { describe, it, expect } from 'vitest'
import { truncate } from './text-utils'

describe('truncate', () => {
  it('leaves short text unchanged', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates long text and appends an ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello…')
  })

  it('treats text exactly at the limit as unchanged', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})
