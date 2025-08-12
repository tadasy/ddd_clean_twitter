import React, { useEffect, useMemo, useState, useCallback, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import './x.css'
import type { User, Post, LoginResponse } from './types'
import { LeftNav } from './components/LeftNav'
import { Composer } from './components/Composer'
import { TweetsList } from './components/TweetsList'
import { LoginCard } from './components/LoginCard'
import { CreateUserCard } from './components/CreateUserCard'
import { useAuth } from './hooks/useAuth'
import { useUsersAndPosts } from './hooks/useUsersAndPosts'
import { useFavorites } from './hooks/useFavorites'
import { useUserForm } from './hooks/useUserForm'
import { usePostComposer } from './hooks/usePostComposer'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

export function App() {
  // Auth
  const { token, me, setMe, authHeader, login: loginApi, logout: logoutApi } = useAuth()

  // Users/Posts
  const { users, posts, setPosts, loadUsers, loadPosts, loadPostsByUserId } = useUsersAndPosts()

  // Favorites
  const { favPostIds, favSet, setFavPostIds, loadFavs, toggleFavorite } = useFavorites(token)

  // Forms (extracted)
  const { name, email, error, setName, setEmail, submitUser, login } = useUserForm({ loadUsers, loginApi })
  const { message, setMessage, submitPost } = usePostComposer({
    token,
    meId: me?.id ?? null,
    authHeader,
    onPosted: async () => { await loadPosts(); if (me?.id) await loadFavs(me.id) },
  })

  // Router
  const { name: routeNameParam } = useParams()
  const routeUserName = routeNameParam ?? null
  const navigate = useNavigate()

  // Effects
  useEffect(() => {
    if (routeUserName) {
      const u = users.find((x) => x.name === routeUserName)
      if (u) void loadPostsByUserId(u.id)
      else setPosts([])
    } else {
      void loadPosts()
    }
  }, [routeUserName, users, loadPostsByUserId, loadPosts, setPosts])

  useEffect(() => {
    if (me?.id) void loadFavs(me.id)
    else setFavPostIds([])
  }, [me?.id, loadFavs, setFavPostIds])

  useEffect(() => {
    // users が後から読み込まれた場合に /me の結果を補完
    if (token && !me && users.length > 0) {
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
  }, [users, token, me, setMe])

  // Handlers
  const handleNameChange = useCallback((v: string) => setName(v), [setName])
  const handleEmailChange = useCallback((v: string) => setEmail(v), [setEmail])
  const handleMessageChange = useCallback((v: string) => setMessage(v), [setMessage])

  const logout = useCallback(() => {
    logoutApi(); setFavPostIds([])
  }, [logoutApi, setFavPostIds])

  const updateCount = useCallback((postId: number, count: number) => {
    setPosts((prev: Post[]) => prev.map((p) => (p.id === postId ? { ...p, count } : p)))
  }, [setPosts])

  const onToggleFavorite = useCallback((postId: number) => {
    if (!token || !me) return
    void toggleFavorite(postId, me.id, updateCount)
  }, [token, me, toggleFavorite, updateCount])

  const goHome = useCallback(() => navigate('/'), [navigate])
  const refreshLatest = useCallback(() => { void loadPosts() }, [loadPosts])

  // Render
  return (
    <div className="x-app">
      <div className="x-layout">
        <LeftNav me={!!me} onHome={goHome} onLatest={refreshLatest} onLogout={logout} />
        <main className="x-main">
          <div className="x-main-header">ホーム</div>
          {routeUserName ? (
            <div className="x-banner">「{routeUserName}」さんの投稿のみ表示中 <button className="btn" onClick={goHome}>全ての投稿</button></div>
          ) : null}
          <Composer me={me} message={message} onChangeMessage={handleMessageChange} onSubmit={submitPost} />
          <TweetsList posts={posts} favSet={favSet} onToggleFav={onToggleFavorite} />
        </main>
        <aside className="x-aside">
          <LoginCard me={me} email={email} onChangeEmail={handleEmailChange} onLogin={login} />
          <CreateUserCard users={users} name={name} email={email} onChangeName={handleNameChange} onChangeEmail={handleEmailChange} onSubmit={submitUser} error={error} />
          <div className="x-card x-muted">DDD Clean Twitter</div>
        </aside>
      </div>
    </div>
  )
}
