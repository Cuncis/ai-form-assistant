import { callApi } from '../messages/message-bus'
import type { GenerateBatchRequest, GenerateFieldResult, GenerationRecord } from '../types/generation.types'
import type { Profile, ProfileDraft } from '../types/profile.types'
import type { Template, TemplateDraft } from '../types/template.types'
import type { ApiResult, UsageSummary } from '../types/api.types'

export async function fetchProfiles(): Promise<ApiResult<Profile[]>> {
  return callApi('GET', '/profiles')
}

export async function createProfile(draft: ProfileDraft): Promise<ApiResult<Profile>> {
  return callApi('POST', '/profiles', draft)
}

export async function updateProfile(id: string, draft: Partial<ProfileDraft>): Promise<ApiResult<Profile>> {
  return callApi('PUT', `/profiles/${id}`, draft)
}

export async function deleteProfile(id: string): Promise<ApiResult<null>> {
  return callApi('DELETE', `/profiles/${id}`)
}

export async function fetchTemplates(): Promise<ApiResult<Template[]>> {
  return callApi('GET', '/templates')
}

export async function createTemplate(draft: TemplateDraft): Promise<ApiResult<Template>> {
  return callApi('POST', '/templates', draft)
}

export async function updateTemplate(id: string, draft: Partial<TemplateDraft>): Promise<ApiResult<Template>> {
  return callApi('PUT', `/templates/${id}`, draft)
}

export async function deleteTemplate(id: string): Promise<ApiResult<null>> {
  return callApi('DELETE', `/templates/${id}`)
}

export async function fetchHistory(): Promise<ApiResult<GenerationRecord[]>> {
  return callApi('GET', '/history')
}

export async function deleteHistoryEntry(id: string): Promise<ApiResult<null>> {
  return callApi('DELETE', `/history/${id}`)
}

export async function fetchUsage(): Promise<ApiResult<UsageSummary>> {
  return callApi('GET', '/usage')
}

export async function generateBatch(
  request: GenerateBatchRequest
): Promise<ApiResult<GenerateFieldResult[]>> {
  return callApi('POST', '/generate/batch', request)
}
