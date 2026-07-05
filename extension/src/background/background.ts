// Service worker — sole network egress point for the extension. No DOM access here.
// State does not persist between wake-ups: everything durable goes through chrome.storage.

import { registerMessageHandler } from '../shared/messages/message-bus'
import { getActiveProfileId } from '../shared/storage/profile-store'
import { getActiveTemplateId } from '../shared/storage/cache-store'
import { ensureContentScriptInjected } from './content-script-injector'
import { handleApiRequest } from './handlers/api.handler'
import { handleAuthRequest } from './handlers/auth.handler'
import { runGenerateFlow } from './handlers/generate.handler'

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({ settings: {} })
  }
})

async function getActiveTabId(): Promise<number | undefined> {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return activeTab?.id
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
    case 'GENERATE_ANSWERS': {
      const tabId = await getActiveTabId()
      if (!tabId) return { type: 'ERROR', error: 'No active tab found.' }
      if (!(await ensureContentScriptInjected(tabId))) {
        return { type: 'ERROR', error: 'AI Form Assistant cannot run on this page.' }
      }
      return runGenerateFlow(tabId, message.profileId, message.templateId)
    }
    case 'FILL_FIELD': {
      const tabId = await getActiveTabId()
      if (!tabId) return { type: 'ERROR', error: 'No active tab found.' }
      const response = await chrome.tabs.sendMessage(tabId, message).catch(() => undefined)
      return response ?? { type: 'ERROR', error: 'Could not reach the page to fill this field.' }
    }
    default:
      return { type: 'ERROR', error: `Unhandled message type: ${(message as { type: string }).type}` }
  }
})

const KEYBOARD_ONLY_COMMANDS = new Set(['fill-accepted', 'open-review-panel'])
const COMMAND_TO_MESSAGE_TYPE: Record<string, string> = {
  'fill-accepted': 'FILL_ACCEPTED_REQUESTED',
  'open-review-panel': 'OPEN_REVIEW_PANEL_REQUESTED',
}

chrome.commands.onCommand.addListener(async (command) => {
  const tabId = await getActiveTabId()
  if (!tabId) return

  if (command === 'generate-answers') {
    const [profileId, templateId] = await Promise.all([getActiveProfileId(), getActiveTemplateId()])
    if (!profileId || !templateId) return // Nothing selected yet — user needs the popup for that.
    if (!(await ensureContentScriptInjected(tabId))) return
    await runGenerateFlow(tabId, profileId, templateId)
    return
  }

  if (KEYBOARD_ONLY_COMMANDS.has(command)) {
    // Review Panel accept-all / open lands in Phase 7 — this proves the shortcut plumbing works.
    await chrome.tabs.sendMessage(tabId, { type: COMMAND_TO_MESSAGE_TYPE[command] }).catch(() => {
      // No content script on this tab (e.g. chrome:// pages) — nothing to do.
    })
  }
})
