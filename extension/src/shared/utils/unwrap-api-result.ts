import type { ApiResult } from '../types/api.types'

/** Turns an ApiResult into a thrown error on failure, so TanStack Query's error state just works. */
export function unwrapApiResult<T>(result: ApiResult<T>): T {
  if (!result.success) {
    throw new Error(result.error)
  }
  return result.data
}
