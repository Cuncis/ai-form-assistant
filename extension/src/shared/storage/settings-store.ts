import { config } from '../config/env'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { storageGet, storageSet } from './chrome-storage'

export interface Settings {
  backendBaseUrl: string
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'id' | 'auto'
  autoFill: boolean
  autoGenerate: boolean
  reviewFirst: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  backendBaseUrl: config.backendBaseUrl,
  theme: 'system',
  language: 'auto',
  autoFill: false,
  autoGenerate: false,
  reviewFirst: true,
}

export async function getSettings(): Promise<Settings> {
  const stored = await storageGet<Settings>(STORAGE_KEYS.settings)
  return { ...DEFAULT_SETTINGS, ...stored }
}

export async function setSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings()
  const next = { ...current, ...patch }
  await storageSet(STORAGE_KEYS.settings, next)
  return next
}
