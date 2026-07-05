/**
 * Background relays keyboard-shortcut messages into the content script, but the actual state
 * (detected fields, review status) lives inside the Widget React tree. This mutable object is
 * the bridge: Widget registers its handlers here on mount, and content.ts's message listener
 * calls through it — simpler than threading a store through React context for three
 * fire-and-forget commands.
 */
export const widgetController: {
  triggerGenerate?: () => void
  fillAccepted?: () => void
  openPanel?: () => void
} = {}
