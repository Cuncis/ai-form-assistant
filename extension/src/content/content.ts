// Content script — has DOM access, limited Chrome APIs. Talks to the service worker via messaging only.

import { resolveAdapter } from './site-adapters/registry'
import type { Message, MessageResponse } from '../shared/messages/message-types'
import type { DetectedField } from '../shared/types/field.types'

/** Detection is re-run for GENERATE_ANSWERS, but FILL_FIELD needs the exact same field objects
 * (and their DOM handles, via detector's internal registry) — not a fresh, possibly-different scan. */
let lastDetectedFields: DetectedField[] = []

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
  switch (message.type) {
    case 'PING':
      sendResponse({ type: 'PONG', url: window.location.href })
      return undefined

    case 'DETECT_FIELDS': {
      const adapter = resolveAdapter(new URL(window.location.href))
      adapter.detectFields().then((fields) => {
        lastDetectedFields = fields
        sendResponse({ type: 'DETECT_FIELDS_RESULT', fields, pageContext: adapter.extractContext() })
      })
      return true
    }

    case 'FILL_FIELD': {
      const field = lastDetectedFields.find((f) => f.id === message.fieldId)
      if (!field) {
        sendResponse({ type: 'FILL_FIELD_RESULT', success: false })
        return undefined
      }
      const adapter = resolveAdapter(new URL(window.location.href))
      adapter.fillField(field, message.value).then((success) => {
        sendResponse({ type: 'FILL_FIELD_RESULT', success })
      })
      return true
    }

    case 'FILL_ACCEPTED_REQUESTED':
    case 'OPEN_REVIEW_PANEL_REQUESTED':
      // Review Panel rendering and its accept-all flow land in Phase 7.
      console.info(`[AI Form Assistant] ${message.type} received — Review UI lands in Phase 7`)
      return undefined

    default:
      return undefined
  }
})
