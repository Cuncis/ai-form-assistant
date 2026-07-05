import { useEffect, useState } from 'react'
import { useProfiles } from '../../shared/hooks/use-profiles'
import { useTemplates } from '../../shared/hooks/use-templates'
import { useGenerateAnswers, useFillField } from '../../shared/hooks/use-generate-answers'
import { getActiveProfileId, setActiveProfileId } from '../../shared/storage/profile-store'
import { getActiveTemplateId, setActiveTemplateId } from '../../shared/storage/cache-store'
import { QueryState } from '../../shared/components/QueryState'
import type { GenerateFieldResult } from '../../shared/types/generation.types'

const CONFIDENCE_STYLES: Record<GenerateFieldResult['confidence'], string> = {
  high: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

export function GenerateView() {
  const profiles = useProfiles()
  const templates = useTemplates()
  const generate = useGenerateAnswers()
  const fillField = useFillField()

  const [profileId, setProfileId] = useState<string>('')
  const [templateId, setTemplateId] = useState<string>('')
  const [filledIds, setFilledIds] = useState<Set<string>>(new Set())

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

  const handleGenerate = () => {
    setFilledIds(new Set())
    generate.mutate({ profileId, templateId })
  }

  const handleFill = (fieldId: string, value: string) => {
    fillField.mutate(
      { fieldId, value },
      { onSuccess: (success) => success && setFilledIds((prev) => new Set(prev).add(fieldId)) }
    )
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
          disabled={!profileId || !templateId || generate.isPending}
          onClick={handleGenerate}
          className="rounded-md bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {generate.isPending ? 'Detecting & generating…' : 'Generate answers for this page'}
        </button>

        {generate.error && <p className="text-xs text-red-600 dark:text-red-400">{(generate.error as Error).message}</p>}

        {generate.data && generate.data.results.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">No fillable fields were found on this page.</p>
        )}

        {generate.data && generate.data.results.length > 0 && (
          <ul className="flex flex-col gap-2">
            {generate.data.results.map((result) => {
              const field = generate.data.fields.find((f) => f.id === result.fieldId)
              return (
                <li key={result.fieldId} className="rounded-md border border-gray-200 p-2 dark:border-gray-800">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium">{field?.label || result.fieldId}</p>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${CONFIDENCE_STYLES[result.confidence]}`}
                    >
                      {result.confidence}
                      {result.cached ? ' · cached' : ''}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{result.answer}</p>
                  {result.assumptions.length > 0 && (
                    <p className="mt-1 text-[10px] italic text-gray-400 dark:text-gray-500">
                      {result.assumptions.join(' ')}
                    </p>
                  )}
                  {result.confidence === 'high' && (
                    <button
                      type="button"
                      disabled={filledIds.has(result.fieldId) || fillField.isPending}
                      onClick={() => handleFill(result.fieldId, result.answer)}
                      className="mt-1 text-xs text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline dark:text-blue-400"
                    >
                      {filledIds.has(result.fieldId) ? 'Filled' : 'Fill'}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        )}

        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          Only high-confidence answers can be filled from here — this list is a stand-in for the
          real in-page Review Panel that lands in Phase 7.
        </p>
      </div>
    </QueryState>
  )
}
