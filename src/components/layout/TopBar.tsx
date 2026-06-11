import React from 'react'
import { useApp } from '../../state/AppContext'
import { useAuth } from '../../state/AuthContext'
import { CITIES } from '../../data/mock/cities'

export const TopBar: React.FC = () => {
  const { city, vertical, setCity } = useApp()
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

      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {CITIES.map(c => {
          const active = c.key === city
          const tierLabel = c.tier === 'ACTIVE_ROLLUP' ? 'ACTIVE' : 'INVESTOR-LED'
          return (
            <button
              key={c.key}
              onClick={() => setCity(c.key)}
              className={`flex flex-col items-center px-3 py-1.5 rounded-full text-xs transition whitespace-nowrap ${
                active ? 'bg-accent-primary text-white' : 'hover:bg-surface-alt text-text-primary'
              }`}
            >
              <span className="font-medium leading-tight">{c.name}</span>
              <span className={`text-[8.5px] tracking-widest leading-tight mt-0.5 ${active ? 'text-white/70' : 'text-text-muted'}`}>
                {tierLabel}
              </span>
            </button>
          )
        })}
      </div>

      {/* The vertical follows the selected city's tier — Nordic roll-up
          cities show the sauna play, investor-led cities show HOW. */}
      <div className="shrink-0 bg-surface-alt rounded-full px-3 py-1.5">
        <span className="text-[11px] uppercase tracking-widest text-text-muted">
          {vertical === 'COASTAL_HOTELS' ? 'HOW Deployment' : 'Sauna Roll-Up'}
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
