import React, { memo, useCallback } from 'react'
import type { Post } from '../types'

export const TweetItem = memo(function TweetItem({ post, isFav, onToggleFav }: { post: Post; isFav: boolean; onToggleFav: (id: number) => void }) {
  const onToggle = useCallback(() => onToggleFav(post.id), [onToggleFav, post.id])
  return (
    <li className="x-tweet">
      <div className="x-avatar">{String(post.userId)}</div>
      <div style={{flex:1}}>
        <div className="meta">
          <span className="name">ユーザー{post.userId}</span>
          <span className="handle">· #{post.id}</span>
        </div>
        <div className="text">{post.message}</div>
      </div>
      <div className="right">
        <div className="x-fav">
          <button className="btn" aria-pressed={isFav} onClick={onToggle}>⭐</button>
          <span>{post.count ?? 0}</span>
        </div>
      </div>
    </li>
  )
})
