import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteHistoryEntry, fetchHistory } from '../api/endpoints'
import { unwrapApiResult } from '../utils/unwrap-api-result'

const HISTORY_QUERY_KEY = ['history']

export function useHistory() {
  return useQuery({
    queryKey: HISTORY_QUERY_KEY,
    queryFn: async () => unwrapApiResult(await fetchHistory()),
  })
}

export function useDeleteHistoryEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => unwrapApiResult(await deleteHistoryEntry(id)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY }),
  })
}
