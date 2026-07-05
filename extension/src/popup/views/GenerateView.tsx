import { useEffect, useState } from 'react'
import { useProfiles } from '../../shared/hooks/use-profiles'
import { useTemplates } from '../../shared/hooks/use-templates'
import { useRunGenerateOnPage } from '../../shared/hooks/use-run-generate-on-page'
import { getActiveProfileId, setActiveProfileId } from '../../shared/storage/profile-store'
import { getActiveTemplateId, setActiveTemplateId } from '../../shared/storage/cache-store'
import { QueryState } from '../../shared/components/QueryState'

export function GenerateView() {
  const profiles = useProfiles()
  const templates = useTemplates()
  const runOnPage = useRunGenerateOnPage()

  const [profileId, setProfileId] = useState<string>('')
  const [templateId, setTemplateId] = useState<string>('')

  useEffect(() => {
    Promise.all([getActiveProfileId(), getActiveTemplateId()]).then(([p, t]) => {
      if (p) setProfileId(p)
      if (t) setTemplateId(t)
    })
  }, [])

  const handleProfileChange = (id: string) => {
    setProfileId(id)
    void setActiveProfileId(id)
  }

  const handleTemplateChange = (id: string) => {
    setTemplateId(id)
    void setActiveTemplateId(id)
  }

  return (
    <QueryState isLoading={profiles.isLoading || templates.isLoading} error={profiles.error || templates.error}>
      <div className="flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          Profile
          <select
            value={profileId}
            onChange={(e) => handleProfileChange(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">Select a profile…</option>
            {profiles.data?.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
          Template
          <select
            value={templateId}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">Select a template…</option>
            {templates.data?.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={!profileId || !templateId || runOnPage.isPending}
          onClick={() => runOnPage.mutate()}
          className="rounded-md bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {runOnPage.isPending ? 'Starting…' : 'Generate answers for this page'}
        </button>

        {runOnPage.isError && (
          <p className="text-xs text-red-600 dark:text-red-400">{(runOnPage.error as Error).message}</p>
        )}
        {runOnPage.isSuccess && (
          <p className="text-xs text-green-600 dark:text-green-400">
            Started — check the page for the review panel.
          </p>
        )}

        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Answers are generated and reviewed directly on the page (or via the floating button /
          keyboard shortcut there) — this just kicks it off for the active tab.
        </p>
      </div>
    </QueryState>
  )
}
