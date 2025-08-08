import React, { memo, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { User } from '../types'

export const CreateUserCard = memo(function CreateUserCard({ users, name, email, onChangeName, onChangeEmail, onSubmit, error }: { users: User[]; name: string; email: string; onChangeName: (v: string) => void; onChangeEmail: (v: string) => void; onSubmit: (e: FormEvent) => void; error: string | null }) {
  return (
    <div className="x-card">
      <h3>ユーザー作成</h3>
      <form onSubmit={onSubmit} style={{display:'grid', gap:8}}>
        <input className="input" placeholder="名前" value={name} onChange={(e) => onChangeName((e.target as HTMLInputElement).value)} />
        <input className="input" placeholder="メール" value={email} onChange={(e) => onChangeEmail((e.target as HTMLInputElement).value)} />
        <button className="btn btn-primary" type="submit">作成</button>
      </form>
      {error && <div className="x-muted" style={{color:'#ff6b6b', marginTop:8}}>{error}</div>}
      <ul style={{listStyle:'none', padding:0, marginTop:8}}>
        {users.map((u) => (
          <li key={u.id} style={{padding:'8px 0', borderBottom:'1px solid var(--border)'}}>
            <span>{u.name} ({u.email})</span>
            <Link className="btn" style={{marginLeft:8}} to={`/user/${encodeURIComponent(u.name)}`}>投稿を見る</Link>
          </li>
        ))}
      </ul>
    </div>
  )
})
