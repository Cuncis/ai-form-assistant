import { vi } from 'vitest'
import { chromeMock } from './chrome-mock'

Object.defineProperty(globalThis, 'chrome', { value: chromeMock, writable: true })

// jsdom doesn't implement the CSS Object Model's CSS.escape() — polyfill the one bit detector.ts
// relies on (used for building attribute selectors from user/page-supplied id values).
if (typeof globalThis.CSS === 'undefined') {
  // @ts-expect-error minimal polyfill, not a full CSS OM implementation
  globalThis.CSS = {}
}
if (typeof globalThis.CSS.escape !== 'function') {
  globalThis.CSS.escape = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`)
}

// jsdom's layout engine always reports 0x0 rects, which would make every element look
// "invisible" to isVisible()'s DOM-detection heuristic — give elements a plausible default size.
Element.prototype.getBoundingClientRect = vi.fn(() => ({
  width: 100,
  height: 20,
  top: 0,
  left: 0,
  right: 100,
  bottom: 20,
  x: 0,
  y: 0,
  toJSON() {
    return this
  },
}))
