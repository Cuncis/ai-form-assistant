import { useEffect, useRef, useState } from 'react'
import { widgetController } from './controller'
import { FloatingButton } from './floating-trigger/FloatingButton'
import { ReviewPanel } from './review-panel/ReviewPanel'
import { resolveAdapter } from '../site-adapters/registry'
import { fillAcceptedFields } from '../autofill/autofill-engine'
import { buildGenerateRequest } from '../../shared/ai/request-builder'
import { generateBatch } from '../../shared/api/endpoints'
import { getActiveProfileId } from '../../shared/storage/profile-store'
import { getActiveTemplateId } from '../../shared/storage/cache-store'
import { mergeFieldsWithResults } from '../../shared/utils/merge-fields-with-results'
import type { GeneratedField } from '../../shared/types/field.types'

type WidgetState = 'idle' | 'loading' | 'reviewing' | 'error'

export function Widget() {
  const [state, setState] = useState<WidgetState>('idle')
  const [fields, setFields] = useState<GeneratedField[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const originalAnswers = useRef(new Map<string, string>())

  const handleGenerate = async () => {
    setState('loading')
    setErrorMessage('')

    const [profileId, templateId] = await Promise.all([getActiveProfileId(), getActiveTemplateId()])
    if (!profileId || !templateId) {
      setErrorMessage('Select a profile and template from the extension popup first.')
      setState('error')
      return
    }

    const adapter = resolveAdapter(new URL(window.location.href))
    const detectedFields = await adapter.detectFields()

    if (detectedFields.length === 0) {
      setErrorMessage('No fillable fields were found on this page.')
      setState('error')
      return
    }

    const request = buildGenerateRequest(detectedFields, adapter.extractContext(), profileId, templateId)
    const result = await generateBatch(request)

    if (!result.success) {
      setErrorMessage(result.error)
      setState('error')
      return
    }

    const merged = mergeFieldsWithResults(detectedFields, result.data)
    originalAnswers.current = new Map(merged.map((field) => [field.id, field.answer]))
    setFields(merged)
    setState('reviewing')
  }

  const handleAccept = async (fieldId: string, value: string) => {
    const wasEdited = originalAnswers.current.get(fieldId) !== value
    const adapter = resolveAdapter(new URL(window.location.href))
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return

    const candidate: GeneratedField = { ...field, answer: value, reviewStatus: 'accepted' }
    const filledIds = await fillAcceptedFields(adapter, [candidate])
    const finalStatus = filledIds.has(fieldId) ? (wasEdited ? 'edited' : 'accepted') : 'fill-failed'
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, answer: value, reviewStatus: finalStatus } : f)))
  }

  const handleReject = (fieldId: string) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, reviewStatus: 'rejected' } : f)))
  }

  const handleAnswerChange = (fieldId: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.id === fieldId ? { ...f, answer: value } : f)))
  }

  const handleFillAllHighConfidence = async () => {
    const adapter = resolveAdapter(new URL(window.location.href))
    const toFill = fields.filter((f) => f.confidence === 'high' && f.reviewStatus === 'pending')
    const filledIds = await fillAcceptedFields(
      adapter,
      toFill.map((f) => ({ ...f, reviewStatus: 'accepted' }))
    )
    const attemptedIds = new Set(toFill.map((f) => f.id))
    setFields((prev) =>
      prev.map((f) => {
        if (!attemptedIds.has(f.id)) return f
        return { ...f, reviewStatus: filledIds.has(f.id) ? 'accepted' : 'fill-failed' }
      })
    )
  }

  const handleClose = () => setState('idle')

  useEffect(() => {
    widgetController.triggerGenerate = () => void handleGenerate()
    widgetController.fillAccepted = () => void handleFillAllHighConfidence()
    widgetController.openPanel = () => setState((prev) => (prev === 'idle' ? 'reviewing' : prev))
  })

  return (
    <>
      <FloatingButton onClick={() => void handleGenerate()} loading={state === 'loading'} />
      {state === 'reviewing' && fields.length > 0 && (
        <ReviewPanel
          fields={fields}
          onAccept={handleAccept}
          onReject={handleReject}
          onAnswerChange={handleAnswerChange}
          onFillAllHighConfidence={() => void handleFillAllHighConfidence()}
          onClose={handleClose}
        />
      )}
      {state === 'error' && (
        <div className="fixed right-4 bottom-20 z-[2147483647] max-w-xs rounded-lg border border-red-200 bg-white p-3 text-sm shadow-lg dark:border-red-900 dark:bg-gray-900">
          <p className="text-red-600 dark:text-red-400">{errorMessage}</p>
          <button
            type="button"
            onClick={handleClose}
            className="mt-2 text-xs text-gray-500 hover:underline dark:text-gray-400"
          >
            Dismiss
          </button>
        </div>
      )}
    </>
  )
}
