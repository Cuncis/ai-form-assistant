import { detectLanguage } from '../../shared/utils/language-detect'
import { truncate } from '../../shared/utils/text-utils'
import type { PageContext } from '../../shared/types/generation.types'

const MAX_VISIBLE_TEXT_CHARS = 8000

export function extractPageContext(): PageContext {
  const visibleText = truncate(document.body.innerText.trim(), MAX_VISIBLE_TEXT_CHARS)

  return {
    url: window.location.href,
    title: document.title,
    metaDescription: getMetaContent('description') ?? undefined,
    companyName: extractCompanyName(),
    visibleText,
    language: document.documentElement.lang?.split('-')[0] || detectLanguage(visibleText.slice(0, 2000)),
  }
}

function getMetaContent(name: string): string | null {
  return (
    document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ??
    document.querySelector(`meta[property="og:${name}"]`)?.getAttribute('content') ??
    null
  )
}

/** og:site_name -> application-name -> ATS URL path segment (greenhouse/lever) -> bare hostname. */
function extractCompanyName(): string | undefined {
  const ogSiteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content')
  if (ogSiteName?.trim()) return ogSiteName.trim()

  const appName = document.querySelector('meta[name="application-name"]')?.getAttribute('content')
  if (appName?.trim()) return appName.trim()

  const { hostname, pathname } = window.location
  if (hostname.endsWith('greenhouse.io') || hostname.endsWith('lever.co')) {
    const segment = pathname.split('/').filter(Boolean)[0]
    if (segment) return segment.replace(/[-_]/g, ' ')
  }

  const bareHost = hostname.replace(/^(www|jobs|careers|boards)\./, '').split('.')[0]
  return bareHost || undefined
}
