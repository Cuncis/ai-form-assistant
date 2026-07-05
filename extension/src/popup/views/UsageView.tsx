import { useUsage } from '../../shared/hooks/use-usage'
import { QueryState } from '../../shared/components/QueryState'

export function UsageView() {
  const usage = useUsage()

  return (
    <QueryState isLoading={usage.isLoading} error={usage.error}>
      {usage.data && (
        <div className="grid grid-cols-2 gap-3 p-4 text-sm">
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
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  )
}
