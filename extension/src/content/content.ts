// Content script — has DOM access, limited Chrome APIs. Talks to the service worker via messaging only.

const COMMAND_MESSAGE_TYPES = [
  'GENERATE_ANSWERS_REQUESTED',
  'FILL_ACCEPTED_REQUESTED',
  'OPEN_REVIEW_PANEL_REQUESTED',
]

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'PING') {
    sendResponse({ type: 'PONG', url: window.location.href })
    return
  }
  if (COMMAND_MESSAGE_TYPES.includes(message?.type)) {
    // Field detection / adapter wiring / autofill orchestration land in Phase 6,
    // review panel rendering in Phase 7. The keyboard-shortcut plumbing is verified end to end.
    console.info(`[AI Form Assistant] ${message.type} received — not implemented yet`)
  }
})
