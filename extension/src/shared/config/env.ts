/** Build-time config. Overridden per-environment via Vite define/env files in Phase 9. */
export const config = {
  backendBaseUrl: import.meta.env.VITE_BACKEND_BASE_URL ?? 'https://api.aiformassistant.app',
  apiVersion: 'v1',
} as const
