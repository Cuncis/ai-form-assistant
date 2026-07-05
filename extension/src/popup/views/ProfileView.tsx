import { useEffect, useState } from 'react'
import { useProfiles } from '../../shared/hooks/use-profiles'
import { getActiveProfileId, setActiveProfileId } from '../../shared/storage/profile-store'
import { QueryState } from '../../shared/components/QueryState'

export function ProfileView() {
  const profiles = useProfiles()
  const [activeId, setActiveId] = useState<string | undefined>()

  useEffect(() => {
    getActiveProfileId().then(setActiveId)
  }, [])

  const selectProfile = async (id: string) => {
    await setActiveProfileId(id)
    setActiveId(id)
  }

  return (
    <QueryState
      isLoading={profiles.isLoading}
      error={profiles.error}
      isEmpty={profiles.data?.length === 0}
      emptyMessage="No profiles yet — add one from the Dashboard."
    >
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {profiles.data?.map((profile) => (
          <li key={profile.id}>
            <button
              type="button"
              onClick={() => selectProfile(profile.id)}
              className="flex w-full flex-col gap-0.5 px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                {profile.name}
                {activeId === profile.id && (
                  <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    Active
                  </span>
                )}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{profile.headline}</span>
            </button>
          </li>
        ))}
      </ul>
    </QueryState>
  )
}
