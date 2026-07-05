import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  // Extensions require a real (headed) Chromium context — headless mode doesn't run them.
  use: {
    headless: false,
  },
  // The extension's own service worker + our fake backend/static servers make each test
  // fairly heavyweight to spin up; run serially rather than fighting for the same profile dir.
  workers: 1,
  timeout: 30_000,
})
