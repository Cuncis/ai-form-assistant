import { useHistory } from '../../shared/hooks/use-history'
import { QueryState } from '../../shared/components/QueryState'

/** Read-only view over the same generation records as the popup's History tab — full detail, no delete. */
export function LogsViewer() {
  const history = useHistory()

  return (
    <div className="p-6">
      <h2 className="mb-3 text-sm font-semibold">Logs</h2>
      <QueryState
        isLoading={history.isLoading}
        error={history.error}
        isEmpty={history.data?.length === 0}
        emptyMessage="No generation logs yet."
      >
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th className="px-3 py-2">Site</th>
                <th className="px-3 py-2">Question</th>
                <th className="px-3 py-2">Confidence</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.data?.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-3 py-2">{entry.siteDomain}</td>
                  <td className="max-w-xs truncate px-3 py-2">{entry.questionText}</td>
                  <td className="px-3 py-2">{entry.confidence}</td>
                  <td className="px-3 py-2">{entry.status}</td>
                  <td className="px-3 py-2">{new Date(entry.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </QueryState>
    </div>
  )
}
