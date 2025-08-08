import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

type User = { id: number; name: string; email: string }
type Post = { id: number; userId: number; message: string; count?: number }

export function App() {
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [actingUserId, setActingUserId] = useState<number>(1)
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [favPostIds, setFavPostIds] = useState<number[]>([])
  const favSet = useMemo(() => new Set(favPostIds), [favPostIds])

  const loadUsers = async () => {
    const res = await fetch(`${API_BASE}/api/users`)
    const data = await res.json()
    setUsers(data)
  }

  const loadPosts = async () => {
    const res = await fetch(`${API_BASE}/api/posts`)
    const data: Post[] = await res.json()
    // fetch favorite counts in parallel
    const withCounts = await Promise.all(
      data.map(async (p) => {
        try {
          const r = await fetch(`${API_BASE}/api/posts/${p.id}/favorites/count`)
          const j = await r.json()
          return { ...p, count: j.count as number }
        } catch {
          return { ...p, count: 0 }
        }
      })
    )
    setPosts(withCounts)
  }

  const loadFavs = async (uid: number) => {
    if (!uid) return setFavPostIds([])
    const r = await fetch(`${API_BASE}/api/users/${uid}/favorites`)
    const j = await r.json()
    setFavPostIds((j.postIds as number[]) ?? [])
  }

  useEffect(() => {
    loadUsers()
    loadPosts()
  }, [])

  useEffect(() => {
    if (actingUserId && actingUserId > 0) loadFavs(actingUserId)
  }, [actingUserId])

  const submitUser = async (e: React.FormEvent) => {
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
  }

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: actingUserId, message }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err?.error ?? 'failed')
    } else {
      setMessage('')
      await loadPosts()
      await loadFavs(actingUserId)
    }
  }

  const toggleFavorite = async (postId: number) => {
    await fetch(`${API_BASE}/api/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: actingUserId, postId }),
    })
    await Promise.all([loadFavs(actingUserId), (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/posts/${postId}/favorites/count`)
        const j = await r.json()
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, count: j.count as number } : p)))
      } catch {}
    })()])
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui, -apple-system', padding: 16 }}>
      <h1>DDD Clean Twitter</h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18 }}>ユーザー作成</h2>
        <form onSubmit={submitUser} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1, padding: 8 }} />
          <input placeholder="メール" value={email} onChange={(e) => setEmail(e.target.value)} style={{ flex: 1, padding: 8 }} />
          <button type="submit" style={{ padding: '8px 16px' }}>作成</button>
        </form>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((u) => (
            <li key={u.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>{u.id}. {u.name} ({u.email})</li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18 }}>投稿</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <label>操作ユーザーID: </label>
          <input type="number" value={actingUserId} onChange={(e) => setActingUserId(Number(e.target.value))} style={{ width: 100, padding: 6 }} />
        </div>
        <form onSubmit={submitPost} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input placeholder="いまどうしてる？" value={message} onChange={(e) => setMessage(e.target.value)} style={{ flex: 1, padding: 8 }} />
          <button type="submit" style={{ padding: '8px 16px' }}>投稿</button>
        </form>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {posts.map((p) => (
            <li key={p.id} style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>#{p.id} ユーザー{p.userId}</div>
                  <div>{p.message}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>⭐ {p.count ?? 0}</div>
                  <button onClick={() => toggleFavorite(p.id)} style={{ padding: '6px 10px', marginTop: 8 }}>
                    {favSet.has(p.id) ? 'Unfavorite' : 'Favorite'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
