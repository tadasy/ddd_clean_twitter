import React, { memo, type FormEvent } from 'react'
import type { User } from '../types'

export const Composer = memo(function Composer({ me, message, onChangeMessage, onSubmit }: { me: User | null; message: string; onChangeMessage: (v: string) => void; onSubmit: (e: FormEvent) => void }) {
  return (
    <section className="x-composer">
      <div className="x-avatar">{me ? me.name.slice(0,1).toUpperCase() : '?'}</div>
      <div className="x-compose-box">
        {me ? (
          <form onSubmit={onSubmit}>
            <input className="x-input" placeholder="いまどうしてる？" value={message} onChange={(e) => onChangeMessage((e.target as HTMLInputElement).value)} />
            <div className="x-actions">
              <button className="btn btn-primary" type="submit">投稿</button>
            </div>
          </form>
        ) : (
          <div className="x-banner">投稿するにはログインしてください</div>
        )}
      </div>
    </section>
  )
})
