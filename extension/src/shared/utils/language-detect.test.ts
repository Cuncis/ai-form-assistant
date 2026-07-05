import { describe, it, expect } from 'vitest'
import { detectLanguage } from './language-detect'

describe('detectLanguage', () => {
  it('detects English from common function words', () => {
    const text = 'We are hiring for the role of Senior Engineer and this is a great opportunity for you.'
    expect(detectLanguage(text)).toBe('en')
  })

  it('detects Indonesian from common function words', () => {
    const text = 'Kami adalah perusahaan yang sedang mencari kandidat untuk bergabung dengan tim kami.'
    expect(detectLanguage(text)).toBe('id')
  })

  it('defaults to English for empty or non-alphabetic text', () => {
    expect(detectLanguage('')).toBe('en')
    expect(detectLanguage('123 456 !!!')).toBe('en')
  })
})
