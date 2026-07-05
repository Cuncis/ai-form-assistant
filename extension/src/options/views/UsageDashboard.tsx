import { useUsage } from '../../shared/hooks/use-usage'
import { QueryState } from '../../shared/components/QueryState'

export function UsageDashboard() {
  const usage = useUsage()

  return (
    <div className="p-6">
      <h2 className="mb-3 text-sm font-semibold">Usage</h2>
      <QueryState isLoading={usage.isLoading} error={usage.error}>
        {usage.data && (
          <div className="grid max-w-md grid-cols-2 gap-3">
            <Stat label="Requests" value={usage.data.requestCount} />
            <Stat label="Tokens used" value={usage.data.tokensUsed} />
            <Stat label="Plan limit" value={usage.data.planLimit} />
            <Stat
              label="Period"
              value={`${new Date(usage.data.periodStart).toLocaleDateString()} – ${new Date(usage.data.periodEnd).toLocaleDateString()}`}
            />
          </div>
        )}
      </QueryState>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-gray-200 p-3 dark:border-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
