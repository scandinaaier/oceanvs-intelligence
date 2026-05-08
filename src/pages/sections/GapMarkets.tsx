import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchGapMarkets } from '../../api/portfolio'
import { Skeleton } from '../../components/common/Skeleton'
import { LmiGauge } from '../../components/common/LmiGauge'
import { STALE_TIMES } from '../../config/api'

export const GapMarkets: React.FC = () => {
  const q = useQuery({
    queryKey: ['gap'],
    queryFn: fetchGapMarkets,
    staleTime: STALE_TIMES.static
  })

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">Gap Markets</span>
        <h1 className="text-2xl font-semibold mt-1">Uncontested Markets — LMI-Qualified Cities Without Oceanvs Presence</h1>
        <p className="text-sm text-text-muted mt-1">Cities where market conditions meet deployment threshold but no Oceanvs position exists.</p>
      </div>

      {q.isLoading ? (
        <Skeleton className="h-[400px]" />
      ) : (
        <section className="grid grid-cols-3 gap-4">
          {q.data?.map(g => (
            <div key={g.id} className="card p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{g.name}</h3>
                  <span className="text-xs text-text-muted">{g.country}</span>
                </div>
                <LmiGauge score={g.lmi} size={64} thickness={6} />
              </div>
              <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-surface-alt text-accent-primary self-start">
                {g.vertical === 'COASTAL_HOTELS' ? 'Coastal Hotels' : 'Premium Saunas'}
              </span>
              <p className="text-sm text-text-primary leading-relaxed">{g.rationale}</p>
              <button className="btn-secondary text-xs mt-auto self-start">Add to Watchlist</button>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
