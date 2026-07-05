import { useQuery } from '@tanstack/react-query'
import { fetchUsage } from '../api/endpoints'
import { unwrapApiResult } from '../utils/unwrap-api-result'

export function useUsage() {
  return useQuery({
    queryKey: ['usage'],
    queryFn: async () => unwrapApiResult(await fetchUsage()),
  })
}
