import { useState, type FormEvent } from 'react'
import { useCreateProfile, useDeleteProfile, useProfiles } from '../../shared/hooks/use-profiles'
import { QueryState } from '../../shared/components/QueryState'

const EMPTY_DRAFT = { name: '', slug: '', headline: '', summary: '', skills: [], experience: [], isDefault: false }

export function ProfilesManager() {
  const profiles = useProfiles()
  const createProfile = useCreateProfile()
  const deleteProfile = useDeleteProfile()
  const [draft, setDraft] = useState(EMPTY_DRAFT)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    createProfile.mutate(
      { ...draft, slug: draft.name.toLowerCase().replace(/\s+/g, '-') },
      { onSuccess: () => setDraft(EMPTY_DRAFT) }
    )
  }

  return (
    <div className="max-w-2xl p-6">
      <h2 className="mb-3 text-sm font-semibold">Profiles</h2>

      <QueryState
        isLoading={profiles.isLoading}
        error={profiles.error}
        isEmpty={profiles.data?.length === 0}
        emptyMessage="No profiles yet — create one below."
      >
        <ul className="mb-6 divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {profiles.data?.map((profile) => (
            <li key={profile.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <div>
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{profile.headline}</p>
              </div>
              <button
                type="button"
                onClick={() => deleteProfile.mutate(profile.id)}
                className="text-xs text-red-600 hover:underline dark:text-red-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </QueryState>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">New profile</h3>
        <input
          required
          placeholder="Name (e.g. WordPress Developer)"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <input
          required
          placeholder="Headline"
          value={draft.headline}
          onChange={(e) => setDraft({ ...draft, headline: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <textarea
          required
          placeholder="Summary"
          rows={3}
          value={draft.summary}
          onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        {createProfile.error && (
          <p className="text-xs text-red-600 dark:text-red-400">{(createProfile.error as Error).message}</p>
        )}
        <button
          type="submit"
          disabled={createProfile.isPending}
          className="self-start rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createProfile.isPending ? 'Creating…' : 'Create profile'}
        </button>
      </form>
    </div>
  )
}
