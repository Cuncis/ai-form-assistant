export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiFailure {
  success: false
  error: string
  code?: string
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure

export interface AuthTokens {
  accessToken: string
  expiresAt: number
}

export interface UsageSummary {
  periodStart: string
  periodEnd: string
  requestCount: number
  tokensUsed: number
  planLimit: number
}
