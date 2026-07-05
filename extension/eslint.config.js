import js from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

const NODE_CONTEXT_FILES = ['vite.config.ts', 'vitest.config.ts', 'playwright.config.ts', 'e2e/**/*.ts']

export default [
  { ignores: ['dist', 'node_modules'] },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    ignores: NODE_CONTEXT_FILES,
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: ['./tsconfig.app.json', './tsconfig.node.json'] },
      globals: { ...globals.browser, ...globals.webextensions },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  {
    // Build config + Playwright E2E files run under Node, not the browser/extension runtime —
    // separate scope so they get Node globals instead, and so react-hooks' rule (which
    // pattern-matches any "use*"-named function) doesn't false-positive on Playwright's
    // `use()` fixture parameter, which has nothing to do with React.
    files: NODE_CONTEXT_FILES,
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: ['./tsconfig.node.json'] },
      // e2e/*.ts runs under Node itself, but some callbacks (page.evaluate/worker.evaluate)
      // are serialized to run inside the browser, so `chrome` needs to resolve there too.
      globals: { ...globals.node, ...globals.webextensions },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
  prettier,
]
