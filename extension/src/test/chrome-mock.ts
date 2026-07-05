import { vi } from 'vitest'

/**
 * Minimal chrome.* mock — enough for storage/messaging unit tests. Extend as needed.
 * Exported directly (not just assigned to globalThis) so tests can call e.g.
 * `chromeMock.storage.local.get.mockResolvedValue(...)` without fighting @types/chrome's
 * overloaded ambient signatures, which don't play well with Vitest's mock typing.
 */
export const chromeMock = {
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      remove: vi.fn().mockResolvedValue(undefined),
    },
    onChanged: { addListener: vi.fn(), removeListener: vi.fn() },
  },
  runtime: {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
    onMessage: { addListener: vi.fn(), removeListener: vi.fn() },
    onInstalled: { addListener: vi.fn() },
    getURL: vi.fn((path: string) => `chrome-extension://fake-id/${path}`),
    getManifest: vi.fn(() => ({ content_scripts: [{ js: ['assets/content.js'] }] })),
  },
  tabs: {
    query: vi.fn().mockResolvedValue([{ id: 1, url: 'https://example.com' }]),
    sendMessage: vi.fn().mockResolvedValue({}),
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue(undefined),
  },
  commands: {
    onCommand: { addListener: vi.fn() },
  },
}
