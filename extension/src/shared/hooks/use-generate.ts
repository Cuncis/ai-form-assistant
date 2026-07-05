import { useMutation } from '@tanstack/react-query'
import { generateBatch } from '../api/endpoints'
import { unwrapApiResult } from '../utils/unwrap-api-result'
import type { GenerateBatchRequest } from '../types/generation.types'

export function useGenerate() {
  return useMutation({
    mutationFn: async (request: GenerateBatchRequest) => unwrapApiResult(await generateBatch(request)),
  })
}
