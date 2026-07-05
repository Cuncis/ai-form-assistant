import { describe, it, expect } from 'vitest'
import { unwrapApiResult } from './unwrap-api-result'

describe('unwrapApiResult', () => {
  it('returns the data on success', () => {
    expect(unwrapApiResult({ success: true, data: { id: '1' } })).toEqual({ id: '1' })
  })

  it('throws an Error with the failure message', () => {
    expect(() => unwrapApiResult({ success: false, error: 'Not found' })).toThrow('Not found')
  })
})
