import React, { memo } from 'react'
import type { Post } from '../types'
import { TweetItem } from './TweetItem'

export const TweetsList = memo(function TweetsList({ posts, favSet, onToggleFav }: { posts: Post[]; favSet: Set<number>; onToggleFav: (id: number) => void }) {
  return (
    <ul className="x-tweets">
      {posts.map((p) => (
        <TweetItem key={p.id} post={p} isFav={favSet.has(p.id)} onToggleFav={onToggleFav} />
      ))}
    </ul>
  )
})
