import type { Profile } from '../types/profile.types'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { storageGet, storageSet } from './chrome-storage'

/** Read-through local cache of backend-owned profiles, for offline/fast popup rendering. */
export async function getCachedProfiles(): Promise<Profile[]> {
  return (await storageGet<Profile[]>(STORAGE_KEYS.profilesCache)) ?? []
}

export async function setCachedProfiles(profiles: Profile[]): Promise<void> {
  await storageSet(STORAGE_KEYS.profilesCache, profiles)
}

export async function getActiveProfileId(): Promise<string | undefined> {
  return storageGet<string>(STORAGE_KEYS.activeProfileId)
}

export async function setActiveProfileId(profileId: string): Promise<void> {
  await storageSet(STORAGE_KEYS.activeProfileId, profileId)
}
