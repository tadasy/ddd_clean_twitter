import { useCallback, useState, type FormEvent } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

export function useUserForm({ loadUsers, loginApi }: { loadUsers: () => Promise<void>; loginApi: (email: string) => Promise<any> }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitUser = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err?.error ?? 'failed')
    } else {
      setName('')
      setEmail('')
      await loadUsers()
    }
  }, [name, email, loadUsers])

  const login = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      await loginApi(email)
    } catch (e: any) {
      setError(e?.message ?? 'network error')
    }
  }, [email, loginApi])

  return { name, email, error, setName, setEmail, submitUser, login }
}
