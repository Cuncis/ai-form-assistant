import { FieldReviewCard } from './FieldReviewCard'
import type { GeneratedField } from '../../../shared/types/field.types'

interface ReviewPanelProps {
  fields: GeneratedField[]
  onAccept: (fieldId: string, value: string) => void
  onReject: (fieldId: string) => void
  onAnswerChange: (fieldId: string, value: string) => void
  onFillAllHighConfidence: () => void
  onClose: () => void
}

/** Rendered inside a Shadow DOM root so host-page CSS can never leak in or out. */
export function ReviewPanel({
  fields,
  onAccept,
  onReject,
  onAnswerChange,
  onFillAllHighConfidence,
  onClose,
}: ReviewPanelProps) {
  const pendingHighConfidenceCount = fields.filter((f) => f.confidence === 'high' && f.reviewStatus === 'pending').length

  return (
    <div className="fixed top-4 right-4 z-[2147483647] flex max-h-[80vh] w-80 flex-col rounded-lg border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-200 px-3 py-2 dark:border-gray-800">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Review answers</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:underline dark:text-gray-400"
        >
          Close
        </button>
      </header>

      <ul className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {fields.map((field) => (
          <FieldReviewCard
            key={field.id}
            field={field}
            onAccept={onAccept}
            onReject={onReject}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </ul>

      {pendingHighConfidenceCount > 0 && (
        <footer className="border-t border-gray-200 p-3 dark:border-gray-800">
          <button
            type="button"
            onClick={onFillAllHighConfidence}
            className="w-full rounded-md bg-blue-600 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
          >
            Accept all {pendingHighConfidenceCount} high-confidence answer{pendingHighConfidenceCount === 1 ? '' : 's'}
          </button>
        </footer>
      )}
    </div>
  )
}
