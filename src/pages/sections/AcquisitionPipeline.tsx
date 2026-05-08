import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApp } from '../../state/AppContext'
import { CITIES } from '../../data/mock/cities'
import { fetchOperators, fetchBrandDeployment } from '../../api/operators'
import { Skeleton } from '../../components/common/Skeleton'
import { STALE_TIMES } from '../../config/api'
import type { Operator } from '../../types'

const fmtEur = (n: number): string => {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `€${(n / 1000).toFixed(0)}K`
  return `€${n}`
}

const Stars: React.FC<{ n: number }> = ({ n }) => (
  <span className="text-accent-primary tracking-widest">{'★'.repeat(n)}<span className="text-border">{'★'.repeat(5 - n)}</span></span>
)

const StatusPill: React.FC<{ status: Operator['status'] }> = ({ status }) => {
  const cls = status === 'In Dialogue' ? 'bg-success/15 text-success' : status === 'Active Interest' ? 'bg-accent-primary/15 text-accent-primary' : 'bg-surface-alt text-text-muted'
  return <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${cls}`}>{status}</span>
}

const OperatorTable: React.FC<{ operators: Operator[] }> = ({ operators }) => (
  <div className="card overflow-hidden">
    <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-surface-alt text-[10px] uppercase tracking-widest text-text-muted">
      <span className="col-span-3">Operator</span>
      <span className="col-span-1">Coastal</span>
      <span className="col-span-2">Capacity</span>
      <span className="col-span-2 text-right">Est. Revenue</span>
      <span className="col-span-1 text-center">LMI Fit</span>
      <span className="col-span-1 text-center">Readiness</span>
      <span className="col-span-2 text-right">Status</span>
    </div>
    <div className="divide-y divide-border">
      {operators.map(o => (
        <div key={o.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-surface-alt/40">
          <div className="col-span-3 flex items-center gap-2">
            <span className="text-sm font-medium">{o.name}</span>
            {o.scaleOpportunity && <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-alert/15 text-alert">Scale Opp</span>}
          </div>
          <span className="col-span-1"><Stars n={o.coastalRating} /></span>
          <span className="col-span-2 text-sm">{o.keysOrSessions} <span className="text-text-muted text-xs">{o.unitLabel}</span></span>
          <span className="col-span-2 text-right text-sm font-medium">{fmtEur(o.estRevenueEur)}</span>
          <span className="col-span-1 text-center text-sm font-semibold text-accent-primary">{o.lmiFit}/10</span>
          <span className="col-span-1 text-center text-sm">{'●'.repeat(o.acquisitionReadiness)}<span className="text-border">{'●'.repeat(5 - o.acquisitionReadiness)}</span></span>
          <div className="col-span-2 flex justify-end"><StatusPill status={o.status} /></div>
        </div>
      ))}
    </div>
  </div>
)

const BrandDeploymentPanel: React.FC<{ city: import('../../types').CityKey; vertical: import('../../types').Vertical }> = ({ city, vertical }) => {
  const dQ = useQuery({
    queryKey: ['deploy', city, vertical],
    queryFn: () => fetchBrandDeployment(city, vertical),
    staleTime: STALE_TIMES.static
  })
  if (dQ.isLoading) return <Skeleton className="h-72" />
  if (!dQ.data) return <div className="card p-6 text-text-muted text-sm">No deployment context defined.</div>

  const d = dQ.data
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="card p-5">
        <span className="eyebrow">Asset Context</span>
        <h3 className="text-base font-semibold mt-2">{d.asset.title}</h3>
        <p className="text-sm text-text-primary mt-2 leading-relaxed">{d.asset.description}</p>
        <div className="mt-3 space-y-1.5 text-xs">
          <div><span className="text-text-muted">Ownership · </span>{d.asset.ownership}</div>
          <div><span className="text-text-muted">Coastal access · </span>{d.asset.coastalAccess}</div>
          <div><span className="text-text-muted">Scale · </span>{d.asset.scale}</div>
        </div>
      </div>

      <div className="card p-5">
        <span className="eyebrow">Investor Relationship</span>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-semibold">{d.investor.status}</span>
          <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
            d.investor.status === 'Committed' ? 'bg-success/15 text-success' :
            d.investor.status === 'Term Sheet' ? 'bg-accent-secondary/15 text-accent-secondary' :
            d.investor.status === 'In Dialogue' ? 'bg-accent-primary/15 text-accent-primary' :
            'bg-surface-alt text-text-muted'
          }`}>status</span>
        </div>
        <p className="text-sm mt-3 leading-relaxed"><span className="text-text-muted">Profile · </span>{d.investor.profile}</p>
        <p className="text-sm mt-2 leading-relaxed"><span className="text-text-muted">Dependencies · </span>{d.investor.dependencies}</p>
      </div>

      <div className="card p-5">
        <span className="eyebrow">Deployment Timeline</span>
        <ol className="mt-3 space-y-2.5">
          {d.timeline.map((t, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className={`mt-1 w-2.5 h-2.5 rounded-full shrink-0 ${t.current ? 'bg-accent-secondary ring-4 ring-accent-secondary/20' : 'bg-border'}`} />
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className={`text-sm ${t.current ? 'font-semibold text-accent-primary' : 'text-text-primary'}`}>{t.phase}</span>
                  <span className="text-[10px] uppercase tracking-widest text-text-muted">{t.duration}</span>
                </div>
                <span className="text-xs text-text-muted block">{t.milestone}</span>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export const AcquisitionPipeline: React.FC = () => {
  const { city, vertical } = useApp()
  const cityMeta = CITIES.find(c => c.key === city)!
  const isInvestorLed = cityMeta.tier === 'INVESTOR_LED'

  const opsQ = useQuery({
    queryKey: ['ops', city, vertical],
    queryFn: () => fetchOperators(city, vertical),
    staleTime: STALE_TIMES.static,
    enabled: !isInvestorLed
  })

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">{isInvestorLed ? 'Investor-Led Deployment' : 'Acquisition Pipeline'}</span>
        <h1 className="text-2xl font-semibold mt-1">
          {isInvestorLed ? `${cityMeta.name} · Brand Deployment Context` : `${cityMeta.name} · Operator Pipeline`}
        </h1>
      </div>

      {isInvestorLed ? (
        <BrandDeploymentPanel city={city} vertical={vertical} />
      ) : opsQ.isLoading ? (
        <Skeleton className="h-72" />
      ) : (
        <OperatorTable operators={opsQ.data ?? []} />
      )}
    </div>
  )
}
