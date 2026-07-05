// Content script — has DOM access, limited Chrome APIs. Talks to the service worker via messaging only.

import { mountWidget } from './ui/mount'
import { widgetController } from './ui/controller'
import type { Message, MessageResponse } from '../shared/messages/message-types'

mountWidget()

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
  switch (message.type) {
    case 'PING':
      sendResponse({ type: 'PONG', url: window.location.href })
      return undefined

    case 'TRIGGER_GENERATE':
      widgetController.triggerGenerate?.()
      return undefined

    case 'FILL_ACCEPTED_REQUESTED':
      widgetController.fillAccepted?.()
      return undefined

    case 'OPEN_REVIEW_PANEL_REQUESTED':
      widgetController.openPanel?.()
      return undefined

    default:
      return undefined
  }
})
