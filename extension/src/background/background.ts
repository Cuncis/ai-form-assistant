// Service worker — sole network egress point for the extension. No DOM access here.
// State does not persist between wake-ups: everything durable goes through chrome.storage.

import { registerMessageHandler } from '../shared/messages/message-bus'
import { ensureContentScriptInjected } from './content-script-injector'
import { handleApiRequest } from './handlers/api.handler'
import { handleAuthRequest } from './handlers/auth.handler'

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({ settings: {} })
  }
})

async function getActiveTabId(): Promise<number | undefined> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return activeTab?.id
}

/** Ensures the content script can run here, then relays a no-payload message to it. */
async function relayToActiveTab(messageType: 'TRIGGER_GENERATE' | 'FILL_ACCEPTED_REQUESTED' | 'OPEN_REVIEW_PANEL_REQUESTED') {
  const tabId = await getActiveTabId()
  if (!tabId) return { ok: false as const, error: 'No active tab found.' }
  if (!(await ensureContentScriptInjected(tabId))) {
    return { ok: false as const, error: 'AI Form Assistant cannot run on this page.' }
  }
  await chrome.tabs.sendMessage(tabId, { type: messageType }).catch(() => undefined)
  return { ok: true as const }
}

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
    case 'RUN_GENERATE_ON_PAGE': {
      const result = await relayToActiveTab('TRIGGER_GENERATE')
      return result.ok ? { type: 'TRIGGERED' } : { type: 'ERROR', error: result.error }
    }
    default:
      return { type: 'ERROR', error: `Unhandled message type: ${(message as { type: string }).type}` }
  }
})

const COMMAND_TO_MESSAGE_TYPE = {
  'generate-answers': 'TRIGGER_GENERATE',
  'fill-accepted': 'FILL_ACCEPTED_REQUESTED',
  'open-review-panel': 'OPEN_REVIEW_PANEL_REQUESTED',
} as const

chrome.commands.onCommand.addListener(async (command) => {
  const messageType = COMMAND_TO_MESSAGE_TYPE[command as keyof typeof COMMAND_TO_MESSAGE_TYPE]
  if (messageType) await relayToActiveTab(messageType)
})
