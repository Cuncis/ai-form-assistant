import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProfile, deleteProfile, fetchProfiles, updateProfile } from '../api/endpoints'
import { unwrapApiResult } from '../utils/unwrap-api-result'
import type { ProfileDraft } from '../types/profile.types'

const PROFILES_QUERY_KEY = ['profiles']

export function useProfiles() {
  return useQuery({
    queryKey: PROFILES_QUERY_KEY,
    queryFn: async () => unwrapApiResult(await fetchProfiles()),
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (draft: ProfileDraft) => unwrapApiResult(await createProfile(draft)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILES_QUERY_KEY }),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, draft }: { id: string; draft: Partial<ProfileDraft> }) =>
      unwrapApiResult(await updateProfile(id, draft)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILES_QUERY_KEY }),
  })
}

export function useDeleteProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => unwrapApiResult(await deleteProfile(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILES_QUERY_KEY }),
  })
}
