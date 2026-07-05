import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getSettings, setSettings, type Settings } from '../storage/settings-store'

const SETTINGS_QUERY_KEY = ['settings']

/** Settings live entirely in chrome.storage.local — no backend round-trip needed. */
export function useSettings() {
  return useQuery({ queryKey: SETTINGS_QUERY_KEY, queryFn: getSettings })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Settings>) => setSettings(patch),
    onSuccess: (next) => queryClient.setQueryData(SETTINGS_QUERY_KEY, next),
  })
}
