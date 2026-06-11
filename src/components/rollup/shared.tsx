import React from 'react'
import type { RollupStage, RollupPriority, BrregMatch } from '../../types'
import { ROLLUP_STAGES } from '../../types'

// Stage styling stays inside the MI7 palette — accents only, no new hues.
export const STAGE_STYLES: Record<RollupStage, { pill: string; dot: string; label: string }> = {
  prospect:       { pill: 'bg-surface-alt text-text-muted',                 dot: 'bg-[var(--text-muted)]',       label: 'Prospect' },
  outreach_sent:  { pill: 'bg-accent-mid/15 text-accent-mid',               dot: 'bg-[var(--accent-mid)]',       label: 'Outreach Sent' },
  engaged:        { pill: 'bg-accent-secondary/15 text-accent-secondary',   dot: 'bg-[var(--accent-secondary)]', label: 'Engaged' },
  meeting_booked: { pill: 'bg-accent-primary/15 text-accent-primary',       dot: 'bg-[var(--accent-primary)]',   label: 'Meeting Booked' },
  loi:            { pill: 'bg-[var(--text-primary)] text-white',            dot: 'bg-[var(--text-primary)]',     label: 'Under LOI' },
  acquired:       { pill: 'bg-success/15 text-success',                     dot: 'bg-[var(--success)]',          label: 'Acquired' },
  passed:         { pill: 'bg-surface-alt text-text-muted line-through',    dot: 'bg-[var(--border)]',           label: 'Passed' },
}

export const StagePill: React.FC<{ stage: RollupStage }> = ({ stage }) => {
  const s = STAGE_STYLES[stage]
  return <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full whitespace-nowrap ${s.pill}`}>{s.label}</span>
}

export const StageSelector: React.FC<{ stage: RollupStage; onChange: (s: RollupStage) => void; disabled?: boolean }> = ({ stage, onChange, disabled }) => (
  <div className="flex flex-wrap gap-1.5">
    {ROLLUP_STAGES.map(s => (
      <button
        key={s.id}
        disabled={disabled}
        onClick={() => onChange(s.id)}
        className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest border transition disabled:opacity-50 ${
          stage === s.id
            ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
            : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent-mid)]'
        }`}
      >
        {s.label}
      </button>
    ))}
  </div>
)

export const PriorityDot: React.FC<{ priority: RollupPriority }> = ({ priority }) => {
  const cls = priority === 'high' ? 'bg-[var(--alert)]' : priority === 'medium' ? 'bg-[var(--accent-mid)]' : 'bg-[var(--border)]'
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-text-muted">
      <span className={`w-2 h-2 rounded-full ${cls}`} />
      {priority}
    </span>
  )
}

export const MatchBadge: React.FC<{ match: BrregMatch }> = ({ match }) => {
  if (match === 'none') return <span className="text-[9px] uppercase tracking-widest text-text-muted">No registry match</span>
  const cls =
    match === 'confirmed' ? 'bg-success/15 text-success' :
    match === 'high' ? 'bg-accent-primary/15 text-accent-primary' :
    'bg-alert/15 text-alert'
  const label = match === 'uncertain' ? 'Match: verify' : `Match: ${match}`
  return <span className={`text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded ${cls}`}>{label}</span>
}

export const SeedModeBanner: React.FC = () => (
  <div className="card px-4 py-3 border-l-4 border-l-[var(--alert)] flex items-center gap-3">
    <span className="text-[10px] uppercase tracking-widest text-alert font-medium shrink-0">Read-only</span>
    <p className="text-xs text-text-muted">
      Showing bundled seed data. Run migration <code className="text-text-primary">006_rollup_crm.sql</code> in the
      Supabase SQL editor to enable shared CRM editing, outreach logging and imports.
    </p>
  </div>
)

export const Stat: React.FC<{ label: string; value: React.ReactNode; accent?: boolean; sub?: string }> = ({ label, value, accent, sub }) => (
  <div className="card p-4">
    <span className="eyebrow">{label}</span>
    <div className={`text-2xl font-semibold mt-2 ${accent ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>{value}</div>
    {sub && <span className="text-[10px] text-text-muted block mt-1">{sub}</span>}
  </div>
)

export const FilterChip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest transition whitespace-nowrap ${
      active ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
    }`}
  >
    {children}
  </button>
)

export const FilterSelect: React.FC<{
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}> = ({ value, onChange, options, className }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`border border-[var(--border)] rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-widest bg-white text-[var(--text-muted)] focus:outline-none ${className ?? ''}`}
  >
    {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
)

export function fmtPct(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`
}

export function growthClass(n: number | null | undefined): string {
  if (n === null || n === undefined) return 'text-text-muted'
  return n >= 0 ? 'text-success' : 'text-alert'
}
