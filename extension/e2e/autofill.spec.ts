import { test, expect } from './fixtures.js'

test.describe('detect -> generate -> review -> fill', () => {
  test.beforeEach(async ({ context, backendUrl }) => {
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
          active_profile_id: '1',
          active_template_id: '1',
        }),
      { backendUrl }
    )
  })

  test('floating button opens a review panel with detected fields, and Accept fills the real DOM', async ({
    context,
    formUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(formUrl, { waitUntil: 'domcontentloaded' })

    const floatingButton = page.locator('button[title="Generate answers with AI Form Assistant"]')
    await expect(floatingButton).toBeVisible({ timeout: 10_000 })
    await floatingButton.click()

    const panel = page.getByRole('heading', { name: 'Review answers' })
    await expect(panel).toBeVisible({ timeout: 10_000 })

    const cards = page.locator('li:has(textarea)')
    await expect(cards).toHaveCount(6)

    // First card ("Full name") is high confidence by the fake backend's round-robin.
    const firstCard = cards.nth(0)
    await firstCard.getByRole('button', { name: 'Accept' }).click()
    await expect(firstCard.getByText('Accepted — filled into the page')).toBeVisible()

    const fullNameValue = await page.locator('#full-name').inputValue()
    expect(fullNameValue).toBe('Fake answer for: Full name')
  })

  test('Reject leaves the underlying field untouched', async ({ context, formUrl }) => {
    const page = await context.newPage()
    await page.goto(formUrl, { waitUntil: 'domcontentloaded' })
    await page.locator('button[title="Generate answers with AI Form Assistant"]').click()
    await expect(page.getByRole('heading', { name: 'Review answers' })).toBeVisible({ timeout: 10_000 })

    const secondCard = page.locator('li:has(textarea)').nth(1) // "Work email", medium confidence
    await secondCard.getByRole('button', { name: 'Reject' }).click()
    await expect(secondCard.getByText('Rejected — left unchanged')).toBeVisible()

    expect(await page.locator('#email-field').inputValue()).toBe('')
  })

  test('editing the answer before accepting fills the edited text, not the original', async ({
    context,
    formUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(formUrl, { waitUntil: 'domcontentloaded' })
    await page.locator('button[title="Generate answers with AI Form Assistant"]').click()
    await expect(page.getByRole('heading', { name: 'Review answers' })).toBeVisible({ timeout: 10_000 })

    const thirdCard = page.locator('li:has(textarea)').nth(2) // "Why are you reaching out?", low confidence
    await thirdCard.locator('textarea').fill('My hand-edited answer.')
    await thirdCard.getByRole('button', { name: 'Accept' }).click()
    await expect(thirdCard.getByText('Edited & accepted — filled into the page')).toBeVisible()

    expect(await page.locator('#reason').inputValue()).toBe('My hand-edited answer.')
  })

  test('a fill that cannot actually succeed is reported honestly, not as a false accept', async ({
    context,
    formUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(formUrl, { waitUntil: 'domcontentloaded' })
    await page.locator('button[title="Generate answers with AI Form Assistant"]').click()
    await expect(page.getByRole('heading', { name: 'Review answers' })).toBeVisible({ timeout: 10_000 })

    // "Topic" is a <select> (index 3, high confidence) whose options never match the fake
    // backend's free-text answer — fillField() must fail, and the panel must say so.
    const topicCard = page.locator('li:has(textarea)').nth(3)
    await topicCard.getByRole('button', { name: 'Accept' }).click()
    await expect(topicCard.getByText(/couldn't fill this automatically/i)).toBeVisible()

    expect(await page.locator('#topic-select').inputValue()).toBe('')
  })

  test('the submit button is never clicked, no matter what', async ({ context, formUrl }) => {
    const page = await context.newPage()
    await page.goto(formUrl, { waitUntil: 'domcontentloaded' })
    await page.locator('button[title="Generate answers with AI Form Assistant"]').click()
    await expect(page.getByRole('heading', { name: 'Review answers' })).toBeVisible({ timeout: 10_000 })

    const cards = page.locator('li:has(textarea)')
    const count = await cards.count()
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i)
      const acceptButton = card.getByRole('button', { name: 'Accept' })
      if (await acceptButton.isVisible().catch(() => false)) {
        await acceptButton.click()
      }
    }

    expect(await page.title()).not.toContain('SUBMIT WAS CLICKED')
  })
})
