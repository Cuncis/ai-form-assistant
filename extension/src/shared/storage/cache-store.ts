import type { Template } from '../types/template.types'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { storageGet, storageSet } from './chrome-storage'

/** Read-through local cache of backend-owned templates, for offline/fast popup rendering. */
export async function getCachedTemplates(): Promise<Template[]> {
  return (await storageGet<Template[]>(STORAGE_KEYS.templatesCache)) ?? []
}

export async function setCachedTemplates(templates: Template[]): Promise<void> {
  await storageSet(STORAGE_KEYS.templatesCache, templates)
}

export async function getActiveTemplateId(): Promise<string | undefined> {
  return storageGet<string>(STORAGE_KEYS.activeTemplateId)
}

export async function setActiveTemplateId(templateId: string): Promise<void> {
  await storageSet(STORAGE_KEYS.activeTemplateId, templateId)
}
