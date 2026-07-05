// Service worker — sole network egress point for the extension. No DOM access here.
// State does not persist between wake-ups: everything durable goes through chrome.storage.

import { registerMessageHandler } from '../shared/messages/message-bus'
import { handleApiRequest } from './handlers/api.handler'
import { handleAuthRequest } from './handlers/auth.handler'

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({ settings: {} })
  }
})

registerMessageHandler(async (message, _sender) => {
  switch (message.type) {
    case 'PING':
      return { type: 'PONG', url: 'background' }
    case 'API_REQUEST':
      return handleApiRequest(message)
    case 'AUTH_LOGIN':
    case 'AUTH_LOGOUT':
    case 'AUTH_STATUS':
      return handleAuthRequest(message)
    case 'DETECT_RESULT':
      // Field detection / adapter wiring / autofill orchestration land in Phase 6.
      return { type: 'PONG', url: message.payload.url }
    default:
      return { type: 'ERROR', error: `Unhandled message type: ${(message as { type: string }).type}` }
  }
})

const COMMAND_TO_MESSAGE_TYPE: Record<string, string> = {
  'generate-answers': 'GENERATE_ANSWERS_REQUESTED',
  'fill-accepted': 'FILL_ACCEPTED_REQUESTED',
  'open-review-panel': 'OPEN_REVIEW_PANEL_REQUESTED',
}

chrome.commands.onCommand.addListener(async (command) => {
  const messageType = COMMAND_TO_MESSAGE_TYPE[command]
  if (!messageType) return

  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!activeTab?.id) return

  // Content script's real handling of these lands alongside the autofill engine (Phase 6/7);
  // for now this just proves the keyboard-shortcut -> active-tab plumbing works end to end.
  await chrome.tabs.sendMessage(activeTab.id, { type: messageType }).catch(() => {
    // No content script on this tab (e.g. chrome:// pages) — nothing to do.
  })
})
