/** Site ids known to the statically-injected content script (see manifest.json content_scripts). */
export const KNOWN_SITE_IDS = [
  'linkedin',
  'greenhouse',
  'lever',
  'ashby',
  'workday',
  'google-forms',
  'typeform',
] as const

export type KnownSiteId = (typeof KNOWN_SITE_IDS)[number]
