import React, { memo } from 'react'

export const LeftNav = memo(function LeftNav({ me, onHome, onLatest, onLogout }: { me: boolean; onHome: () => void; onLatest: () => void; onLogout: () => void }) {
  return (
    <nav className="x-nav">
      <button className="btn btn-full" onClick={onHome}>
        <span className="label">ホーム</span>
      </button>
      <button className="btn btn-full" onClick={onLatest}>
        <span className="label">最新</span>
      </button>
      {me ? (
        <button className="btn btn-full" onClick={onLogout}><span className="label">ログアウト</span></button>
      ) : null}
    </nav>
  )
})
