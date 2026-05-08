import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export const Login: React.FC = () => {
  const { login, email: existing } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (existing) navigate('/dashboard', { replace: true })
  }, [existing, navigate])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const r = login(email)
    if (r.ok) navigate('/dashboard', { replace: true })
    else setError(r.reason)
  }

  return (
    <div className="fixed inset-0 overflow-hidden flex items-center justify-center" style={{ background: '#050810' }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(26,107,154,0.35) 0%, rgba(5,8,16,0.95) 55%, #050810 100%)'
        }}
      />

      <div className="relative w-full max-w-[480px] px-6 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <span style={{ fontSize: 12, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.72)', fontWeight: 600 }}>
            OCEANVS
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase' }}>
            Intelligence Platform
          </span>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col items-center gap-3 w-full">
          <div
            className="flex items-center w-full rounded-full overflow-hidden backdrop-blur"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(91,164,207,0.32)'
            }}
          >
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your authorised email"
              className="flex-1 bg-transparent border-0 outline-none px-6"
              style={{ color: 'rgba(255,255,255,0.92)', fontSize: 12, letterSpacing: '0.05em', height: 44 }}
            />
            <button
              type="submit"
              className="m-1 px-5 py-2.5 rounded-full text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{
                background: 'linear-gradient(135deg, #1A6B9A 0%, #2AA8B4 100%)',
                color: 'white'
              }}
            >
              Sign in
            </button>
          </div>
          {error && (
            <span style={{ fontSize: 11, color: '#E05C2A', letterSpacing: '0.04em' }}>{error}</span>
          )}
        </form>

        <a
          href="/"
          style={{ fontSize: 10, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.42)', textTransform: 'uppercase' }}
        >
          ← Back
        </a>
      </div>
    </div>
  )
}
