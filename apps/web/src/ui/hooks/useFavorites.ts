import { useCallback, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000'

export function useFavorites(token: string | null) {
  const [favPostIds, setFavPostIds] = useState<number[]>([])
  const favSet = useMemo(() => new Set(favPostIds), [favPostIds])

  const loadFavs = useCallback(async (uid: number) => {
    if (!uid) return setFavPostIds([])
    const r = await fetch(`${API_BASE}/api/users/${uid}/favorites`)
    const j = await r.json()
    setFavPostIds((j.postIds as number[]) ?? [])
  }, [])

  const authHeader = useMemo(() => (token ? { Authorization: `Bearer ${token}` } : undefined), [token])

  const toggleFavorite = useCallback(async (postId: number, meId: number, updateCount: (postId: number, count: number) => void) => {
    if (!token || !meId) return
    await fetch(`${API_BASE}/api/favorites/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(authHeader || {}) },
      body: JSON.stringify({ postId }),
    })
    try {
      const r = await fetch(`${API_BASE}/api/posts/${postId}/favorites/count`)
      const j = await r.json()
      updateCount(postId, j.count as number)
    } catch {}
    await loadFavs(meId)
  }, [token, authHeader, loadFavs])

  return { favPostIds, favSet, setFavPostIds, loadFavs, toggleFavorite }
}
