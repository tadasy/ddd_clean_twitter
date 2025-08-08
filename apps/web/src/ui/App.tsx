import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

type User = { id: number; name: string; email: string }

export function App() {
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch(`${API_BASE}/api/users`)
    const data = await res.json()
    setUsers(data)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
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
      await load()
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui, -apple-system', padding: 16 }}>
      <h1>DDD Clean Twitter</h1>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <input placeholder="メール" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <button type="submit" style={{ padding: '8px 16px' }}>作成</button>
      </form>
      {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map((u) => (
          <li key={u.id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{u.name}</div>
            <div style={{ color: '#555' }}>{u.email}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
