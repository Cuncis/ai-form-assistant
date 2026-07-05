import { useState, type FormEvent } from 'react'
import { useCreateTemplate, useDeleteTemplate, useTemplates } from '../../shared/hooks/use-templates'
import { QueryState } from '../../shared/components/QueryState'
import type { TemplateDraft, WritingTone } from '../../shared/types/template.types'

const TONES: WritingTone[] = ['professional', 'friendly', 'formal', 'concise', 'enthusiastic']

const EMPTY_DRAFT: TemplateDraft = {
  name: '',
  systemPrompt: '',
  tone: 'professional',
  maxWords: 200,
  writingStyle: '',
}

export function TemplatesManager() {
  const templates = useTemplates()
  const createTemplate = useCreateTemplate()
  const deleteTemplate = useDeleteTemplate()
  const [draft, setDraft] = useState<TemplateDraft>(EMPTY_DRAFT)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    createTemplate.mutate(draft, { onSuccess: () => setDraft(EMPTY_DRAFT) })
  }

  return (
    <div className="max-w-2xl p-6">
      <h2 className="mb-3 text-sm font-semibold">Templates</h2>

      <QueryState
        isLoading={templates.isLoading}
        error={templates.error}
        isEmpty={templates.data?.length === 0}
        emptyMessage="No templates yet — create one below."
      >
        <ul className="mb-6 divide-y divide-gray-100 rounded-md border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {templates.data?.map((template) => (
            <li key={template.id} className="flex items-center justify-between gap-2 px-3 py-2">
              <div>
                <p className="text-sm font-medium">{template.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {template.tone} · max {template.maxWords} words
                </p>
              </div>
              {!template.isSystem && (
                <button
                  type="button"
                  onClick={() => deleteTemplate.mutate(template.id)}
                  className="text-xs text-red-600 hover:underline dark:text-red-400"
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </QueryState>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">New template</h3>
        <input
          required
          placeholder="Name (e.g. Job Application)"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <div className="flex gap-2">
          <select
            value={draft.tone}
            onChange={(e) => setDraft({ ...draft, tone: e.target.value as WritingTone })}
            className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
          >
            {TONES.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={20}
            max={1000}
            value={draft.maxWords}
            onChange={(e) => setDraft({ ...draft, maxWords: Number(e.target.value) })}
            className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
          />
        </div>
        <input
          placeholder="Writing style (optional)"
          value={draft.writingStyle}
          onChange={(e) => setDraft({ ...draft, writingStyle: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <textarea
          required
          placeholder="System prompt"
          rows={3}
          value={draft.systemPrompt}
          onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        {createTemplate.error && (
          <p className="text-xs text-red-600 dark:text-red-400">{(createTemplate.error as Error).message}</p>
        )}
        <button
          type="submit"
          disabled={createTemplate.isPending}
          className="self-start rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {createTemplate.isPending ? 'Creating…' : 'Create template'}
        </button>
      </form>
    </div>
  )
}
