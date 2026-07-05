import type { ReactNode } from 'react'

interface QueryStateProps {
  isLoading: boolean
  error: unknown
  isEmpty?: boolean
  emptyMessage?: string
  children: ReactNode
}

/** Small shared loading/error/empty wrapper so every view doesn't reinvent this. */
export function QueryState({ isLoading, error, isEmpty, emptyMessage, children }: QueryStateProps) {
  if (isLoading) {
    return <p className="p-4 text-sm text-gray-500 dark:text-gray-400">Loading…</p>
  }
  if (error) {
    return (
      <p className="p-4 text-sm text-red-600 dark:text-red-400">
        {error instanceof Error ? error.message : 'Something went wrong.'}
      </p>
    )
  }
  if (isEmpty) {
    return <p className="p-4 text-sm text-gray-500 dark:text-gray-400">{emptyMessage ?? 'Nothing here yet.'}</p>
  }
  return <>{children}</>
}
