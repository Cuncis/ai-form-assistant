import { useDeleteHistoryEntry, useHistory } from '../../shared/hooks/use-history'
import { QueryState } from '../../shared/components/QueryState'

export function HistoryView() {
  const history = useHistory()
  const deleteEntry = useDeleteHistoryEntry()

  return (
    <QueryState
      isLoading={history.isLoading}
      error={history.error}
      isEmpty={history.data?.length === 0}
      emptyMessage="No generations yet."
    >
      <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
        {history.data?.map((entry) => (
          <li key={entry.id} className="flex items-start justify-between gap-2 px-4 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{entry.questionText}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {entry.siteDomain} · {new Date(entry.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => deleteEntry.mutate(entry.id)}
              className="shrink-0 text-xs text-red-600 hover:underline dark:text-red-400"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </QueryState>
  )
}
