import type { GeneratedField } from '../../../shared/types/field.types'

interface FieldReviewCardProps {
  field: GeneratedField
  onAccept: (fieldId: string, value: string) => void
  onReject: (fieldId: string) => void
  onAnswerChange: (fieldId: string, value: string) => void
}

const CONFIDENCE_STYLES: Record<GeneratedField['confidence'], string> = {
  high: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  low: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const STATUS_STYLES: Record<GeneratedField['reviewStatus'], string> = {
  pending: '',
  accepted: 'border-green-300 dark:border-green-800',
  edited: 'border-blue-300 dark:border-blue-800',
  rejected: 'border-gray-200 opacity-50 dark:border-gray-800',
  'fill-failed': 'border-orange-300 dark:border-orange-800',
}

export function FieldReviewCard({ field, onAccept, onReject, onAnswerChange }: FieldReviewCardProps) {
  // A failed fill can still be retried (e.g. after editing the text to match a <select> option),
  // so it stays interactive like 'pending' — only accepted/edited/rejected are final states.
  const isDecided = field.reviewStatus === 'accepted' || field.reviewStatus === 'edited' || field.reviewStatus === 'rejected'
  const canRetry = field.reviewStatus === 'pending' || field.reviewStatus === 'fill-failed'

  return (
    <li className={`rounded-md border border-gray-200 p-2 dark:border-gray-800 ${STATUS_STYLES[field.reviewStatus]}`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">{field.label || 'Untitled field'}</p>
        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${CONFIDENCE_STYLES[field.confidence]}`}>
          {field.confidence}
        </span>
      </div>

      <textarea
        value={field.answer}
        disabled={isDecided}
        onChange={(e) => onAnswerChange(field.id, e.target.value)}
        rows={2}
        className="w-full resize-none rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-700 disabled:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:disabled:bg-gray-900"
      />

      {field.assumptions.length > 0 && (
        <p className="mt-1 text-[10px] italic text-gray-400 dark:text-gray-500">{field.assumptions.join(' ')}</p>
      )}

      {field.reviewStatus === 'fill-failed' && (
        <p className="mt-1 text-[10px] font-medium text-orange-600 dark:text-orange-400">
          Couldn't fill this automatically — edit the answer above (e.g. to match a dropdown
          option exactly) and try again, or fill it in manually.
        </p>
      )}

      {canRetry ? (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => onAccept(field.id, field.answer)}
            className="rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Accept
          </button>
          <button
            type="button"
            onClick={() => onReject(field.id)}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reject
          </button>
        </div>
      ) : (
        <p className="mt-2 text-[10px] font-medium text-gray-500 dark:text-gray-400">
          {field.reviewStatus === 'accepted' && 'Accepted — filled into the page'}
          {field.reviewStatus === 'edited' && 'Edited & accepted — filled into the page'}
          {field.reviewStatus === 'rejected' && 'Rejected — left unchanged'}
        </p>
      )}
    </li>
  )
}
