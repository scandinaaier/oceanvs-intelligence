import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export const Login: React.FC = () => {
  const { signIn, email: existing, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && existing) navigate('/dashboard', { replace: true })
  }, [existing, loading, navigate])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const r = await signIn(email, password)
    setSubmitting(false)
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
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="w-full bg-transparent border-0 outline-none rounded-full backdrop-blur"
            style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 12,
              letterSpacing: '0.05em',
              height: 44,
              padding: '0 24px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(91,164,207,0.32)'
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete="current-password"
            className="w-full bg-transparent border-0 outline-none rounded-full backdrop-blur"
            style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 12,
              letterSpacing: '0.05em',
              height: 44,
              padding: '0 24px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(91,164,207,0.32)'
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-5 py-3 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{
              background: 'linear-gradient(135deg, #1A6B9A 0%, #2AA8B4 100%)',
              color: 'white',
              opacity: submitting ? 0.6 : 1
            }}
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
          {error && (
            <span style={{ fontSize: 11, color: '#E05C2A', letterSpacing: '0.04em', textAlign: 'center' }}>{error}</span>
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
