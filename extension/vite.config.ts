import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { crx } from '@crxjs/vite-plugin'
import baseManifest from './manifest.json' with { type: 'json' }

// E2E tests need the content script to auto-inject on the local test-fixture server, since
// that's the only reliable way to exercise it under Playwright automation (the real activeTab
// + on-demand-injection path for generic sites requires a genuine user gesture that Chrome
// tracks per its own trigger channels — verified manually that it can't be synthesized via
// CDP; see ARCHITECTURE.md §2.1). Only added for E2E builds, never in the real one.
const manifest = structuredClone(baseManifest) as typeof baseManifest & {
  content_scripts: { matches: string[] }[]
}
if (process.env.E2E_TEST === 'true') {
  manifest.content_scripts[0].matches.push('http://127.0.0.1/*')
}

export default defineConfig({
  plugins: [react(), tailwindcss(), crx({ manifest })],
  server: {
    port: 5173,
    strictPort: true,
    hmr: { port: 5173 },
  },
})
