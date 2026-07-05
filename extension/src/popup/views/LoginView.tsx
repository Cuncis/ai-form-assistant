import { useState, type FormEvent } from 'react'
import { useLogin } from '../../shared/hooks/use-auth'

export function LoginView() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Sign in to your AI Form Assistant account to continue.
      </p>

      <label className="flex flex-col gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
        Password
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-gray-300 px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
      </label>

      {login.data?.error && <p className="text-xs text-red-600 dark:text-red-400">{login.data.error}</p>}

      <button
        type="submit"
        disabled={login.isPending}
        className="rounded-md bg-blue-600 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {login.isPending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
