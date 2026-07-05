import { apiRequest } from '../../shared/api/http-client'
import { buildGenerateRequest } from '../../shared/ai/request-builder'
import type { MessageResponse } from '../../shared/messages/message-types'
import type { DetectedField } from '../../shared/types/field.types'
import type { GenerateFieldResult, PageContext } from '../../shared/types/generation.types'

/**
 * Detect -> build request -> call backend, for one active tab. Shared by the popup's
 * GENERATE_ANSWERS message and the "generate-answers" keyboard shortcut.
 */
export async function runGenerateFlow(tabId: number, profileId: string, templateId: string): Promise<MessageResponse> {
  const detectResponse = (await chrome.tabs
    .sendMessage(tabId, { type: 'DETECT_FIELDS' })
    .catch(() => undefined)) as MessageResponse | undefined

  if (!detectResponse || detectResponse.type !== 'DETECT_FIELDS_RESULT') {
    return { type: 'ERROR', error: 'Could not detect fields on this page — is the extension active here?' }
  }

  const fields: DetectedField[] = detectResponse.fields
  const pageContext: PageContext = detectResponse.pageContext

  if (fields.length === 0) {
    return { type: 'ERROR', error: 'No fillable fields were found on this page.' }
  }

  const request = buildGenerateRequest(fields, pageContext, profileId, templateId)
  const result = await apiRequest<GenerateFieldResult[]>('/generate/batch', {
    method: 'POST',
    body: JSON.stringify(request),
  })

  if (!result.success) {
    return { type: 'ERROR', error: result.error }
  }

  return { type: 'GENERATE_ANSWERS_RESULT', results: result.data, fields }
}
