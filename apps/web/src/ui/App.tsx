import React, { useEffect, useMemo, useState, useCallback, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './x.css'
import type { User, Post, LoginResponse } from './types'
import { LeftNav } from './components/LeftNav'
import { Composer } from './components/Composer'
import { TweetsList } from './components/TweetsList'
import { LoginCard } from './components/LoginCard'
import { CreateUserCard } from './components/CreateUserCard'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

export function App() {
  // ----- States -----
  const [users, setUsers] = useState<User[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [me, setMe] = useState<User | null>(null)

  const [message, setMessage] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [favPostIds, setFavPostIds] = useState<number[]>([])

  // Router
  const { name: routeNameParam } = useParams()
  const routeUserName = routeNameParam ?? null
  const navigate = useNavigate()

  // Derived
  const favSet = useMemo(() => new Set(favPostIds), [favPostIds])
  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token])

  const setTokenAndPersist = useCallback((t: string | null) => {
    setToken(t)
    if (t) localStorage.setItem('token', t)
    else localStorage.removeItem('token')
  }, [])

  // ----- Loaders (memoized) -----
  const loadUsers = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/users`)
    const data = await res.json()
    setUsers(data)
  }, [])

  const loadPosts = useCallback(async () => {
    const res = await fetch(`${API_BASE}/api/posts`)
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
  }, [])

  const loadFavs = useCallback(async (uid: number) => {
    if (!uid) return setFavPostIds([])
    const r = await fetch(`${API_BASE}/api/users/${uid}/favorites`)
    const j = await r.json()
    setFavPostIds((j.postIds as number[]) ?? [])
  }, [])

  const loadPostsByUserId = useCallback(async (uid: number) => {
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
  }, [])

  // ----- Effects -----
  useEffect(() => {
    void loadUsers(); void loadPosts()
  }, [loadUsers, loadPosts])

  useEffect(() => {
    if (routeUserName) {
      const u = users.find((x) => x.name === routeUserName)
      if (u) void loadPostsByUserId(u.id)
      else setPosts([])
    } else {
      void loadPosts()
    }
  }, [routeUserName, users, loadPostsByUserId, loadPosts])

  useEffect(() => {
    if (me?.id) void loadFavs(me.id)
    else setFavPostIds([])
  }, [me?.id, loadFavs])

  useEffect(() => {
    const init = async () => {
      if (!token) return
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const j = await res.json()
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
    void init()
    // users に依存させると毎回再評価されるため token のみ。users 変化時は別で補完
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    // users が後から読み込まれた場合に /me の結果を補完
    if (token && !me) {
      // /me 再取得はせず、メールで補完
      const restore = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const j = await res.json()
            const u = users.find((x: User) => x.email === j.email) || null
            setMe(u)
          }
        } catch {}
      }
      void restore()
    }
  }, [users, token, me])

  // ----- Handlers (memoized) -----
  const handleNameChange = useCallback((v: string) => setName(v), [])
  const handleEmailChange = useCallback((v: string) => setEmail(v), [])
  const handleMessageChange = useCallback((v: string) => setMessage(v), [])

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
  }, [email, setTokenAndPersist])

  const logout = useCallback(() => {
    setTokenAndPersist(null)
    setMe(null)
    setFavPostIds([])
  }, [setTokenAndPersist])

  const submitPost = useCallback(async (e: FormEvent) => {
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
  }, [token, me, authHeader, message, loadPosts, loadFavs])

  const toggleFavorite = useCallback(async (postId: number) => {
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
  }, [token, me, authHeader, loadFavs])

  const goHome = useCallback(() => navigate('/'), [navigate])
  const refreshLatest = useCallback(() => { void loadPosts() }, [loadPosts])

  // ----- Render -----
  return (
    <div className="x-app">
      <div className="x-layout">
        {/* Left Nav */}
        <LeftNav me={!!me} onHome={goHome} onLatest={refreshLatest} onLogout={logout} />

        {/* Main */}
        <main className="x-main">
          <div className="x-main-header">ホーム</div>

          {routeUserName ? (
            <div className="x-banner">「{routeUserName}」さんの投稿のみ表示中 <button className="btn" onClick={goHome}>全ての投稿</button></div>
          ) : null}

          {/* Composer */}
          <Composer me={me} message={message} onChangeMessage={handleMessageChange} onSubmit={submitPost} />

          {/* Tweets */}
          <TweetsList posts={posts} favSet={favSet} onToggleFav={toggleFavorite} />
        </main>

        {/* Right Aside */}
        <aside className="x-aside">
          <LoginCard me={me} email={email} onChangeEmail={handleEmailChange} onLogin={login} />

          <CreateUserCard
            users={users}
            name={name}
            email={email}
            onChangeName={handleNameChange}
            onChangeEmail={handleEmailChange}
            onSubmit={submitUser}
            error={error}
          />

          <div className="x-card x-muted">DDD Clean Twitter</div>
        </aside>
      </div>
    </div>
  )
}
