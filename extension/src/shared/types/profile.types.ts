export interface ProfileExperience {
  title: string
  organization: string
  summary: string
  startDate?: string
  endDate?: string
}

/** Mirrors the backend `profiles` table. Cached locally for offline/fast popup rendering. */
export interface Profile {
  id: string
  name: string
  slug: string
  headline: string
  summary: string
  skills: string[]
  experience: ProfileExperience[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type ProfileDraft = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
