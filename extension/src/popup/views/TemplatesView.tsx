import { useTemplates } from '../../shared/hooks/use-templates'
import { QueryState } from '../../shared/components/QueryState'

export function TemplatesView() {
  const templates = useTemplates()

  return (
    <QueryState
      isLoading={templates.isLoading}
      error={templates.error}
      isEmpty={templates.data?.length === 0}
      emptyMessage="No templates yet — add one from the Dashboard."
    >
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {templates.data?.map((template) => (
          <li key={template.id} className="px-4 py-2.5">
            <p className="text-sm font-medium">{template.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {template.tone} · max {template.maxWords} words
            </p>
          </li>
        ))}
      </ul>
    </QueryState>
  )
}
