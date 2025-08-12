import { useCallback, useEffect, useState } from 'react'
import type { Post, User } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

export function useUsersAndPosts() {
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])

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

  useEffect(() => { void loadUsers(); void loadPosts() }, [loadUsers, loadPosts])

  return { users, posts, setPosts, loadUsers, loadPosts, loadPostsByUserId }
}
