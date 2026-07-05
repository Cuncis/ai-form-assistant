import type { GeneratedField } from '../../../shared/types/field.types'

interface FieldReviewCardProps {
  field: GeneratedField
  onAccept: (fieldId: string) => void
  onReject: (fieldId: string) => void
  onEdit: (fieldId: string, value: string) => void
}

export function FieldReviewCard(_props: FieldReviewCardProps) {
  throw new Error('Not implemented — Phase 7')
}
