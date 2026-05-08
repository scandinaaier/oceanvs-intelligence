import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export const Landing: React.FC = () => {
  const [revealed, setRevealed] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { login, email: existing } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (existing) {
      navigate('/dashboard', { replace: true })
      return
    }
    const t1 = setTimeout(() => setRevealed(true), 5500)
    return () => clearTimeout(t1)
  }, [existing, navigate])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const r = login(email)
    if (r.ok) navigate('/dashboard', { replace: true })
    else setError(r.reason)
  }

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ background: '#050810' }}>
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(26,107,154,0.35) 0%, rgba(5,8,16,0.95) 55%, #050810 100%)'
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(5,8,16,0.18) 0%, transparent 35%, transparent 55%, rgba(5,8,16,0.72) 100%)'
        }}
      />

      <div
        className="absolute top-1/2 left-1/2 flex flex-col items-center text-center"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: revealed ? 0 : 1,
          transition: 'opacity 2s ease',
          pointerEvents: 'none',
          fontFamily: "'Cormorant Garamond', serif"
        }}
      >
        <span style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(1.8rem, 3.4vw, 2.4rem)', color: 'rgba(255,255,255,0.62)' }}>
          In Aqua Sanitas
        </span>
        <span style={{ marginTop: '0.4rem', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.42)' }}>
          (In water, health)
        </span>
      </div>

      <div
        className="absolute top-8 left-8 max-w-[320px] pointer-events-none"
        style={{ opacity: revealed ? 1 : 0, transition: 'opacity 1.8s ease' }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.03em' }}>
          OCEANVS Group is the world&rsquo;s first institutionalized coastal wellness hospitality platform.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,0.62)', letterSpacing: '0.03em', marginTop: '0.9rem' }}>
          We invest, acquire and operate premium waterfront assets &mdash; from hotels and saunas to community-driven wellness businesses across the Nordics and beyond.
        </p>
      </div>

      <div className="absolute top-8 right-8 flex items-center gap-3" style={{ opacity: revealed ? 1 : 0, transition: 'opacity 1.8s ease' }}>
        <span style={{ fontSize: 12, letterSpacing: '0.32em', color: 'rgba(255,255,255,0.62)', fontWeight: 600 }}>
          OCEANVS
        </span>
      </div>

      <div
        className="absolute left-1/2 w-full max-w-[520px] px-6"
        style={{
          top: '72%',
          transform: 'translate(-50%, -50%)',
          opacity: revealed ? 1 : 0,
          transition: 'opacity 2.2s ease'
        }}
      >
        {!showLogin ? (
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setShowLogin(true)}
              className="px-8 py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{
                background: 'linear-gradient(135deg, #1A6B9A 0%, #2AA8B4 100%)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 8px 32px rgba(42,168,180,0.25)'
              }}
            >
              Enter Intelligence Platform
            </button>
            <span style={{ fontSize: 10, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.32)' }}>
              Authorised access only
            </span>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="flex flex-col items-center gap-3 w-full"
          >
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
            <button
              type="button"
              onClick={() => { setShowLogin(false); setError(null); setEmail('') }}
              style={{ fontSize: 10, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.42)' }}
            >
              Back
            </button>
          </form>
        )}
      </div>

      <footer
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1"
        style={{ opacity: revealed ? 1 : 0, transition: 'opacity 2.2s ease 0.6s' }}
      >
        <div className="flex gap-6">
          <a href="/privacy" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase' }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase' }}>Terms</a>
        </div>
        <span style={{ fontSize: 10, letterSpacing: '0.05em', color: 'rgba(255,255,255,0.22)' }}>
          &copy; OCEANVS Group 2026. All rights reserved.
        </span>
      </footer>
    </div>
  )
}
