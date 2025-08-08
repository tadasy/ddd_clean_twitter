import { useEffect, useMemo, useState, type FormEvent } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

type User = { id: number; name: string; email: string }
type Post = { id: number; userId: number; message: string; count?: number }

type LoginResponse = { token: string; user: User }

export function App() {
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [me, setMe] = useState<User | null>(null)

  const [actingUserId, setActingUserId] = useState<number>(1)
  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [favPostIds, setFavPostIds] = useState<number[]>([])
  const [routeUserName, setRouteUserName] = useState<string | null>(null)
  const favSet = useMemo(() => new Set(favPostIds), [favPostIds])

  const setTokenAndPersist = (t: string | null) => {
    setToken(t)
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
  }

  const authHeader = token ? { Authorization: `Bearer ${token}` } : undefined

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

  const getRouteUserName = () => {
    const m = /^\/user\/([^/]+)$/.exec(window.location.pathname)
    return m ? decodeURIComponent(m[1]) : null
  }

  const loadPostsByUserId = async (uid: number) => {
    const res = await fetch(`${API_BASE}/api/users/${uid}/posts`)
    const data: Post[] = await res.json()
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

  const handleRouteChange = async () => {
    const name = getRouteUserName()
    setRouteUserName(name)
    if (name) {
      // users が未ロードの場合は後続の users 依存の useEffect で読み込み
      const u = users.find((x) => x.name === name)
      if (u) {
        await loadPostsByUserId(u.id)
      }
    } else {
      await loadPosts()
    }
  }

  useEffect(() => {
    loadUsers()
    loadPosts()
  }, [])

  useEffect(() => {
    if (actingUserId && actingUserId > 0) loadFavs(actingUserId)
  }, [actingUserId])

  useEffect(() => {
    // 起動時にトークンがあれば /me を確認
    const init = async () => {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const j = await res.json()
          // j = { sub, email } なので users から補完
          const u = users.find((x: User) => x.email === j.email) || null
          setMe(u)
          if (u) setActingUserId(u.id)
        } else {
          setTokenAndPersist(null)
          setMe(null)
        }
      } catch {
        setTokenAndPersist(null)
        setMe(null)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    // 初期ロード
    handleRouteChange()
    // popstate 対応（戻る/進む）
    const onPop = () => { void handleRouteChange() }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // users が揃ったら、ルートに応じて投稿を読み込む
    const name = getRouteUserName()
    if (name) {
      const u = users.find((x) => x.name === name)
      if (u) void loadPostsByUserId(u.id)
      else setPosts([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users])

  const submitUser = async (e: FormEvent) => {
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

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err?.error ?? 'login failed')
        return
      }
      const j: LoginResponse = await res.json()
      setTokenAndPersist(j.token)
      setMe(j.user)
      setActingUserId(j.user.id)
    } catch (e) {
      setError('network error')
    }
  }

  const logout = () => {
    setTokenAndPersist(null)
    setMe(null)
  }

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError('ログインが必要です')
      return
    }
    const res = await fetch(`${API_BASE}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authHeader || {}) },
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
    if (!token) {
      setError('ログインが必要です')
      return
    }
    await fetch(`${API_BASE}/api/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authHeader || {}) },
      body: JSON.stringify({ userId: actingUserId, postId }),
    })
    await Promise.all([
      loadFavs(actingUserId),
      (async () => {
        try {
          const r = await fetch(`${API_BASE}/api/posts/${postId}/favorites/count`)
          const j = await r.json()
          setPosts((prev: Post[]) => prev.map((p) => (p.id === postId ? { ...p, count: j.count as number } : p)))
        } catch {}
      })(),
    ])
  }

  const navigateToUser = (name: string | null) => {
    const path = name ? `/user/${encodeURIComponent(name)}` : '/'
    window.history.pushState({}, '', path)
    void handleRouteChange()
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'system-ui, -apple-system', padding: 16 }}>
      <h1>DDD Clean Twitter</h1>

      {routeUserName ? (
        <div style={{ margin: '8px 0', padding: '8px', background: '#f8f8f8', borderRadius: 8 }}>
          <span>「{routeUserName}」さんの投稿のみ表示中</span>
          <button onClick={() => navigateToUser(null)} style={{ marginLeft: 12, padding: '6px 10px' }}>全ての投稿</button>
        </div>
      ) : null}

      <section style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18 }}>ログイン</h2>
        {me ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>ログイン中: {me.name} ({me.email})</div>
            <button onClick={logout} style={{ padding: '6px 12px' }}>ログアウト</button>
          </div>
        ) : (
          <form onSubmit={login} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              placeholder="メール"
              value={email}
              onChange={(e: any) => setEmail((e.target as HTMLInputElement).value)}
              style={{ flex: 1, padding: 8 }}
            />
            <button type="submit" style={{ padding: '8px 16px' }}>ログイン</button>
          </form>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18 }}>ユーザー作成</h2>
        <form onSubmit={submitUser} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input placeholder="名前" value={name} onChange={(e: any) => setName((e.target as HTMLInputElement).value)} style={{ flex: 1, padding: 8 }} />
          <input placeholder="メール" value={email} onChange={(e: any) => setEmail((e.target as HTMLInputElement).value)} style={{ flex: 1, padding: 8 }} />
          <button type="submit" style={{ padding: '8px 16px' }}>作成</button>
        </form>
        {error && <div style={{ color: 'crimson', marginBottom: 8 }}>{error}</div>}
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map((u) => (
            <li key={u.id} style={{ padding: 8, borderBottom: '1px solid #eee' }}>
              {u.id}. {u.name} ({u.email})
              <button style={{ marginLeft: 12, padding: '4px 8px' }} onClick={() => navigateToUser(u.name)}>このユーザーの投稿</button>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18 }}>投稿</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <label>操作ユーザーID: </label>
          <input type="number" value={actingUserId} onChange={(e: any) => setActingUserId(Number((e.target as HTMLInputElement).value))} style={{ width: 100, padding: 6 }} />
        </div>
        <form onSubmit={submitPost} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input placeholder="いまどうしてる？" value={message} onChange={(e: any) => setMessage((e.target as HTMLInputElement).value)} style={{ flex: 1, padding: 8 }} />
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
