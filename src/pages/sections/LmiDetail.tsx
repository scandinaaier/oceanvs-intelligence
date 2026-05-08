import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApp } from '../../state/AppContext'
import { CITIES } from '../../data/mock/cities'
import { fetchLmi } from '../../api/lmi'
import { LmiGauge } from '../../components/common/LmiGauge'
import { Skeleton } from '../../components/common/Skeleton'
import { STALE_TIMES } from '../../config/api'

const ComponentBar: React.FC<{ name: string; score: number; insight: string }> = ({ name, score, insight }) => {
  const pct = (score / 20) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium">{name}</span>
        <span className="text-sm font-semibold text-accent-primary">{score}/20</span>
      </div>
      <div className="h-3 rounded-full bg-surface-alt overflow-hidden">
        <div className="h-full bg-accent-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-text-muted mt-2 leading-relaxed">{insight}</p>
    </div>
  )
}

const TrendChart: React.FC<{ data: { month: string; score: number }[] }> = ({ data }) => {
  const w = 600
  const h = 180
  const padding = { l: 30, r: 10, t: 14, b: 24 }
  const min = Math.min(...data.map(d => d.score)) - 4
  const max = Math.max(...data.map(d => d.score)) + 4
  const xStep = (w - padding.l - padding.r) / (data.length - 1)
  const yScale = (s: number) => h - padding.b - ((s - min) / (max - min)) * (h - padding.t - padding.b)

  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${padding.l + i * xStep} ${yScale(d.score)}`).join(' ')
  const area = `${path} L ${padding.l + (data.length - 1) * xStep} ${h - padding.b} L ${padding.l} ${h - padding.b} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
      <defs>
        <linearGradient id="lmi-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#lmi-area)" />
      <path d={path} fill="none" stroke="var(--accent-primary)" strokeWidth={2} />
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={padding.l + i * xStep} cy={yScale(d.score)} r={3} fill="var(--accent-primary)" />
          <text
            x={padding.l + i * xStep}
            y={h - 8}
            textAnchor="middle"
            fontSize="9"
            fill="var(--text-muted)"
            style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            {d.month}
          </text>
        </g>
      ))}
      {[min, (min + max) / 2, max].map((v, i) => (
        <g key={i}>
          <text x={4} y={yScale(v) + 3} fontSize="9" fill="var(--text-muted)">{Math.round(v)}</text>
          <line x1={padding.l} x2={w - padding.r} y1={yScale(v)} y2={yScale(v)} stroke="var(--border)" strokeDasharray="2 4" opacity="0.5" />
        </g>
      ))}
    </svg>
  )
}

export const LmiDetail: React.FC = () => {
  const { city } = useApp()
  const cityMeta = CITIES.find(c => c.key === city)!
  const q = useQuery({
    queryKey: ['lmi', city],
    queryFn: () => fetchLmi(city),
    staleTime: STALE_TIMES.static
  })

  if (q.isLoading) return <Skeleton className="h-[600px] mt-2" />
  if (!q.data) return null
  const lmi = q.data

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">LMI Detail · {cityMeta.tier === 'ACTIVE_ROLLUP' ? 'Active Rollup' : 'Investor-Led'}</span>
        <h1 className="text-2xl font-semibold mt-1">{cityMeta.name} · Lifestyle Market Index</h1>
      </div>

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-4 card p-6 flex flex-col items-center justify-center">
          <LmiGauge score={lmi.total} size={180} thickness={14} />
          <span className="eyebrow mt-3">{cityMeta.name}</span>
          <span className="text-xs text-text-muted mt-1" title="Oceanvs Lifestyle Market Index — proprietary composite signal.">
            Proprietary composite
          </span>
        </div>

        <div className="col-span-8 card p-6 flex flex-col gap-5">
          <span className="eyebrow">Component Breakdown</span>
          <div className="flex flex-col gap-4">
            {lmi.components.map(c => (
              <ComponentBar key={c.name} name={c.name} score={c.score} insight={c.insight} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-7 card p-5">
          <span className="eyebrow">12-Month LMI Trend</span>
          <div className="mt-3">
            <TrendChart data={lmi.trend} />
          </div>
        </div>

        <div className="col-span-5 card p-5 flex flex-col gap-3">
          <span className="eyebrow">Comparable Cities</span>
          {lmi.comparables.map(c => (
            <div key={c.city} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
              <LmiGauge score={c.score} size={48} thickness={5} showLabel={false} />
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{c.city}</span>
                  <span className="text-xs font-semibold text-accent-primary">{c.score}</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed mt-1">{c.note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
