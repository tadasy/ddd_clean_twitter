import { useCallback, useState, type FormEvent } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

export function usePostComposer({ token, meId, authHeader, onPosted }: { token: string | null; meId: number | null; authHeader?: { Authorization: string }; onPosted: () => Promise<void> }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submitPost = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token || !meId) {
      setError('ログインが必要です')
      return
    }
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authHeader || {}) },
      body: JSON.stringify({ message }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err?.error ?? 'failed')
    } else {
      setMessage('')
      await onPosted()
    }
  }, [token, meId, authHeader, message, onPosted])

  return { message, setMessage, error, submitPost }
}
