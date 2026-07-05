import type { GenerateBatchRequest, GenerateFieldResult } from '../types/generation.types'

/** Sole client-side entry point for AI generation — always via the backend, never a vendor directly. */
export async function requestGeneration(
  _request: GenerateBatchRequest
): Promise<GenerateFieldResult[]> {
  throw new Error('Not implemented — Phase 5')
}
