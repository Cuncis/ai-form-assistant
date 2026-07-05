export type WritingTone = 'professional' | 'friendly' | 'formal' | 'concise' | 'enthusiastic'

/** Mirrors the backend `templates` table. System templates have no owning user. */
export interface Template {
  id: string
  name: string
  systemPrompt: string
  tone: WritingTone
  maxWords: number
  writingStyle: string
  isSystem: boolean
}

export type TemplateDraft = Omit<Template, 'id' | 'isSystem'>
