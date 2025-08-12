import { useCallback, useEffect, useMemo, useState } from 'react'
import type { User, LoginResponse } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [me, setMe] = useState<User | null>(null)

  const setTokenAndPersist = useCallback((t: string | null) => {
    setToken(t)
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
  }, [])

  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token])

  useEffect(() => {
    const init = async () => {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const j = await res.json()
          // me は外部から補完する前提
          setMe((prev) => prev ?? { id: 0, name: '', email: j.email })
        } else {
          setTokenAndPersist(null)
          setMe(null)
        }
      } catch {
        setTokenAndPersist(null)
        setMe(null)
      }
    }
    void init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const login = useCallback(async (email: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err?.error ?? 'login failed')
    }
    const j: LoginResponse = await res.json()
    setTokenAndPersist(j.token)
    setMe(j.user)
    return j.user
  }, [setTokenAndPersist])

  const logout = useCallback(() => {
    setTokenAndPersist(null)
    setMe(null)
  }, [setTokenAndPersist])

  return { token, me, setMe, authHeader, setTokenAndPersist, login, logout }
}
