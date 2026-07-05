import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthStatus, login, logout } from '../auth/auth-service'

const AUTH_QUERY_KEY = ['auth', 'status']

export function useAuthStatus() {
  return useQuery({ queryKey: AUTH_QUERY_KEY, queryFn: getAuthStatus })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
    onSuccess: (outcome) => {
      if (outcome.authenticated) queryClient.setQueryData(AUTH_QUERY_KEY, true)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(AUTH_QUERY_KEY, false),
  })
}
