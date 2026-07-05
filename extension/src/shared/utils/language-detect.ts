export type DetectedLanguage = 'en' | 'id'

// Common function words — cheap and reliable enough to tell English from Indonesian on a
// page-sized sample without pulling in a real language-detection library.
const INDONESIAN_MARKERS = [
  'yang',
  'dan',
  'di',
  'ke',
  'dari',
  'untuk',
  'dengan',
  'adalah',
  'ini',
  'itu',
  'tidak',
  'saya',
  'kami',
  'anda',
  'akan',
  'pada',
  'dalam',
]

const ENGLISH_MARKERS = ['the', 'and', 'of', 'to', 'in', 'is', 'for', 'with', 'that', 'this', 'are', 'was', 'be', 'on', 'as']

export function detectLanguage(text: string): DetectedLanguage {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? []
  if (words.length === 0) return 'en'

  const wordSet = words
  let idScore = 0
  let enScore = 0

  for (const word of wordSet) {
    if (INDONESIAN_MARKERS.includes(word)) idScore++
    if (ENGLISH_MARKERS.includes(word)) enScore++
  }

  return idScore > enScore ? 'id' : 'en'
}
