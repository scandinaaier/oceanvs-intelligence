import React from 'react'
import { useApp } from '../../state/AppContext'
import { useAuth } from '../../state/AuthContext'
import { CITIES } from '../../data/mock/cities'

export const TopBar: React.FC = () => {
  const { city, setCity } = useApp()
  const { signOut, email } = useAuth()

  const onSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <header className="card mx-4 mt-4 px-5 py-3 flex items-center gap-6 sticky top-4 z-30">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-semibold tracking-[0.28em] text-accent-primary">OCEANVS</span>
        <span className="eyebrow text-[9px]">Intelligence</span>
      </div>

      {/* Investor-led hotel cities were removed in MI8 — the platform is
          focused on the Nordic sauna roll-up and campsite acquisitions.
          (Mock data for Malta / Porto Heli / Osaka remains in the repo.) */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {CITIES.filter(c => c.tier === 'ACTIVE_ROLLUP').map(c => {
          const active = c.key === city
          return (
            <button
              key={c.key}
              onClick={() => setCity(c.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                active ? 'bg-accent-primary text-white' : 'hover:bg-surface-alt text-text-primary'
              }`}
            >
              {c.name}
            </button>
          )
        })}
      </div>

      <div className="shrink-0 bg-surface-alt rounded-full px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-widest text-text-muted">
          Sauna &amp; Campsite Roll-Up
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {email && <span className="text-[11px] text-text-muted hidden lg:inline">{email}</span>}
        <button onClick={onSignOut} className="text-[11px] text-text-muted hover:text-accent-primary transition">
          Sign out
        </button>
      </div>
    </header>
  )
}
