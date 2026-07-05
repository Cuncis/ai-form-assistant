import { test, expect } from './fixtures.js'

test('all dashboard sections are reachable', async ({ context, extensionId }) => {
  const options = await context.newPage()
  await options.goto(`chrome-extension://${extensionId}/src/options/options.html`)

  for (const section of ['Profiles', 'Templates', 'API Settings', 'Usage', 'Logs', 'Import/Export']) {
    await options.getByRole('button', { name: section }).click()
  }

  await expect(options.locator('body')).toBeVisible()
})

test('backend URL persists across a reload', async ({ context, extensionId }) => {
  const options = await context.newPage()
  await options.goto(`chrome-extension://${extensionId}/src/options/options.html`)
  await options.getByRole('button', { name: 'API Settings' }).click()

  await options.locator('input[type=url]').fill('http://127.0.0.1:9999')
  await options.getByRole('button', { name: 'Save' }).click()
  await options.waitForTimeout(300)

  await options.reload()
  await options.getByRole('button', { name: 'API Settings' }).click()

  await expect(options.locator('input[type=url]')).toHaveValue('http://127.0.0.1:9999')
})
