import { test, expect } from './fixtures.js'

test('shows the login gate when unauthenticated', async ({ context, extensionId }) => {
  const popup = await context.newPage()
  await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)

  await expect(popup.locator('input[type=email]')).toBeVisible()
  await expect(popup.locator('input[type=password]')).toBeVisible()
  await expect(popup.getByRole('button', { name: 'Generate' })).not.toBeVisible()
})

test('surfaces a network error inline instead of crashing when the backend is unreachable', async ({
  context,
  extensionId,
}) => {
  const options = await context.newPage()
  await options.goto(`chrome-extension://${extensionId}/src/options/options.html`)
  await options.getByRole('button', { name: 'API Settings' }).click()
  // Port 1 is never listening — a reliable "unreachable" target without depending on timing.
  await options.locator('input[type=url]').fill('http://127.0.0.1:1')
  await options.getByRole('button', { name: 'Save' }).click()
  await options.close()

  const popup = await context.newPage()
  await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)
  await popup.fill('input[type=email]', 'test@example.com')
  await popup.fill('input[type=password]', 'password123')
  await popup.click('button[type=submit]')

  await expect(popup.getByText(/network error/i)).toBeVisible({ timeout: 10_000 })
})

test('once authenticated, all tabs are reachable', async ({ context, extensionId, backendUrl }) => {
  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
  await worker.evaluate(
    ({ backendUrl }) =>
      chrome.storage.local.set({
        auth_token: 'fake-token',
        settings: {
          backendBaseUrl: backendUrl,
          theme: 'system',
          language: 'auto',
          autoFill: false,
          autoGenerate: false,
          reviewFirst: true,
        },
      }),
    { backendUrl }
  )

  const popup = await context.newPage()
  await popup.goto(`chrome-extension://${extensionId}/src/popup/popup.html`)

  for (const tab of ['Generate', 'Profile', 'Templates', 'History', 'Usage', 'Settings']) {
    await popup.getByRole('button', { name: tab, exact: true }).click()
  }

  await expect(popup.locator('body')).toBeVisible()
})
