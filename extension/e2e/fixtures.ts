import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'node:path'
import { startFakeBackend } from './fixtures/fake-backend.js'
import { startStaticServer } from './fixtures/static-server.js'

const EXT_PATH = path.join(import.meta.dirname, '../dist')

interface Fixtures {
  context: BrowserContext
  extensionId: string
  backendUrl: string
  formUrl: string
}

export const test = base.extend<Fixtures>({
  // Playwright inspects each fixture function's parameter list at load time to know which
  // other fixtures it depends on — it must be a literal destructuring pattern (even an empty
  // one), so this can't be simplified to a named/unused parameter.
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    // Two gotchas discovered the hard way (see ARCHITECTURE.md):
    // 1. Playwright's default launch args include --disable-extensions, which silently
    //    overrides --load-extension unless explicitly excluded via ignoreDefaultArgs.
    // 2. This must be Playwright's bundled Chromium, not branded Google Chrome — real
    //    Chrome rejects --disable-extensions-except/--load-extension outright ("not allowed
    //    in Google Chrome"). @playwright/test's default `chromium` channel is already the
    //    bundled build, so no channel option is needed (and none should be added).
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--no-sandbox', `--disable-extensions-except=${EXT_PATH}`, `--load-extension=${EXT_PATH}`],
    })
    await use(context)
    await context.close()
  },

  extensionId: async ({ context }, use) => {
    let [worker] = context.serviceWorkers()
    if (!worker) worker = await context.waitForEvent('serviceworker', { timeout: 10_000 })
    await use(worker.url().split('/')[2]!)
  },

  // eslint-disable-next-line no-empty-pattern
  backendUrl: async ({}, use) => {
    const { url, close } = await startFakeBackend()
    await use(url)
    await close()
  },

  // eslint-disable-next-line no-empty-pattern
  formUrl: async ({}, use) => {
    const { url, close } = await startStaticServer()
    await use(`${url}/test-form.html`)
    await close()
  },
})

export { expect } from '@playwright/test'
