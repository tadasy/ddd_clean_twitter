import React, { memo, type FormEvent } from 'react'
import type { User } from '../types'

export const LoginCard = memo(function LoginCard({ me, email, onChangeEmail, onLogin }: { me: User | null; email: string; onChangeEmail: (v: string) => void; onLogin: (e: FormEvent) => void }) {
  return (
    <div className="x-card">
      <h3>ログイン</h3>
      {me ? (
        <div className="x-muted">{me.name}（{me.email}）でログイン中</div>
      ) : (
        <form onSubmit={onLogin} style={{display:'grid', gap:8}}>
          <input className="input" placeholder="メール" value={email} onChange={(e) => onChangeEmail((e.target as HTMLInputElement).value)} />
          <button className="btn btn-primary" type="submit">ログイン</button>
        </form>
      )}
    </div>
  )
})
