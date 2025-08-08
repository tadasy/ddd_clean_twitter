import React, { useEffect, useMemo, useState, type FormEvent } from 'react'
import './x.css'

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
      const u = users.find((x: User) => x.name === name)
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

  // ログインユーザーの変更に応じてお気に入りを再取得
  useEffect(() => {
    if (me?.id) loadFavs(me.id)
    else setFavPostIds([])
  }, [me?.id])

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
      const u = users.find((x: User) => x.name === name)
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
    } catch (e) {
      setError('network error')
    }
  }

  const logout = () => {
    setTokenAndPersist(null)
    setMe(null)
    setFavPostIds([])
  }

  const submitPost = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!token || !me) {
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
      await loadPosts()
      await loadFavs(me.id)
    }
  }

  const toggleFavorite = async (postId: number) => {
    if (!token || !me) {
      setError('ログインが必要です')
      return
    }
    await fetch(`${API_BASE}/api/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authHeader || {}) },
      body: JSON.stringify({ postId }),
    })
    await Promise.all([
      loadFavs(me.id),
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
    <div className="x-app">
      <div className="x-layout">
        {/* Left Nav */}
        <nav className="x-nav">
          {/* ロゴ削除 */}
          <button className="btn btn-full" onClick={() => navigateToUser(null)}>
            <span className="label">ホーム</span>
          </button>
          <a className="btn btn-full" href="#" onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); loadPosts() }}>
            <span className="label">最新</span>
          </a>
          {me ? (
            <button className="btn btn-full" onClick={logout}><span className="label">ログアウト</span></button>
          ) : null}
        </nav>

        {/* Main */}
        <main className="x-main">
          <div className="x-main-header">ホーム</div>

          {routeUserName ? (
            <div className="x-banner">「{routeUserName}」さんの投稿のみ表示中 <button className="btn" onClick={() => navigateToUser(null)}>全ての投稿</button></div>
          ) : null}

          {/* Composer */}
          <section className="x-composer">
            <div className="x-avatar">{me ? me.name.slice(0,1).toUpperCase() : '?'}</div>
            <div className="x-compose-box">
              {me ? (
                <form onSubmit={submitPost}>
                  <input className="x-input" placeholder="いまどうしてる？" value={message} onChange={(e: any) => setMessage((e.target as HTMLInputElement).value)} />
                  <div className="x-actions">
                    <button className="btn btn-primary" type="submit">投稿</button>
                  </div>
                </form>
              ) : (
                <div className="x-banner">投稿するにはログインしてください</div>
              )}
            </div>
          </section>

          {/* Tweets */}
          <ul className="x-tweets">
            {posts.map((p) => (
              <li key={p.id} className="x-tweet">
                <div className="x-avatar">{String(p.userId)}</div>
                <div style={{flex:1}}>
                  <div className="meta">
                    <span className="name">ユーザー{p.userId}</span>
                    <span className="handle">· #{p.id}</span>
                  </div>
                  <div className="text">{p.message}</div>
                </div>
                <div className="right">
                  <div className="x-fav">
                    <button className="btn" onClick={() => toggleFavorite(p.id)}>⭐</button>
                    <span>{p.count ?? 0}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </main>

        {/* Right Aside */}
        <aside className="x-aside">
          <div className="x-card">
            <h3>ログイン</h3>
            {me ? (
              <div className="x-muted">{me.name}（{me.email}）でログイン中</div>
            ) : (
              <form onSubmit={login} style={{display:'grid', gap:8}}>
                <input className="input" placeholder="メール" value={email} onChange={(e: any) => setEmail((e.target as HTMLInputElement).value)} />
                <button className="btn btn-primary" type="submit">ログイン</button>
              </form>
            )}
          </div>

          <div className="x-card">
            <h3>ユーザー作成</h3>
            <form onSubmit={submitUser} style={{display:'grid', gap:8}}>
              <input className="input" placeholder="名前" value={name} onChange={(e: any) => setName((e.target as HTMLInputElement).value)} />
              <input className="input" placeholder="メール" value={email} onChange={(e: any) => setEmail((e.target as HTMLInputElement).value)} />
              <button className="btn btn-primary" type="submit">作成</button>
            </form>
            {error && <div className="x-muted" style={{color:'#ff6b6b', marginTop:8}}>{error}</div>}
            <ul style={{listStyle:'none', padding:0, marginTop:8}}>
              {users.map((u) => (
                <li key={u.id} style={{padding:'8px 0', borderBottom:'1px solid var(--border)'}}>
                  <span>{u.name} ({u.email})</span>
                  <button className="btn" style={{marginLeft:8}} onClick={() => navigateToUser(u.name)}>投稿を見る</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="x-card x-muted">DDD Clean Twitter</div>
        </aside>
      </div>
    </div>
  )
}
