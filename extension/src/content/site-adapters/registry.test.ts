import { describe, it, expect } from 'vitest'
import { resolveAdapter } from './registry'

describe('resolveAdapter', () => {
  const cases: [string, string][] = [
    ['https://www.linkedin.com/jobs/view/123', 'linkedin'],
    ['https://boards.greenhouse.io/acme/jobs/1', 'greenhouse'],
    ['https://job-boards.greenhouse.io/acme/jobs/1', 'greenhouse'],
    ['https://jobs.lever.co/acme/abc-123', 'lever'],
    ['https://jobs.ashbyhq.com/acme/abc-123', 'ashby'],
    ['https://acme.wd5.myworkdayjobs.com/en-US/careers/job/1', 'workday'],
    ['https://docs.google.com/forms/d/e/abc/viewform', 'google-forms'],
    ['https://acme.typeform.com/to/abc123', 'typeform'],
    ['https://random-company.com/contact-us', 'generic'],
    ['https://example.org/careers/apply', 'generic'],
  ]

  it.each(cases)('resolves %s to the %s adapter', (url, expectedId) => {
    expect(resolveAdapter(new URL(url)).id).toBe(expectedId)
  })

  it('never returns undefined — generic is always the fallback', () => {
    const adapter = resolveAdapter(new URL('https://totally-unknown-domain.xyz/'))
    expect(adapter).toBeDefined()
    expect(adapter.id).toBe('generic')
  })

  it('does not match LinkedIn jobs pattern against LinkedIn feed pages', () => {
    // linkedin.adapter.ts scopes matches() to /jobs — a feed URL should fall through to generic.
    expect(resolveAdapter(new URL('https://www.linkedin.com/feed/')).id).toBe('generic')
  })
})
