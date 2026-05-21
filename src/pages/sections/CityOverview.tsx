import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useApp } from '../../state/AppContext'
import { CITIES } from '../../data/mock/cities'
import { fetchCityKpi, fetchCityBrief } from '../../api/cities'
import { fetchLiveSignals, fetchCurrency, fetchWeather } from '../../api/signals'
import { fetchTeamSignalsByCity } from '../../api/teamSignals'
import { LmiGauge } from '../../components/common/LmiGauge'
import { Skeleton } from '../../components/common/Skeleton'
import { STALE_TIMES } from '../../config/api'
import type { Signal } from '../../types'

const KpiCard: React.FC<{ label: string; children: React.ReactNode; tone?: 'success' | 'amber' | 'alert' | 'neutral' }> = ({
  label,
  children,
  tone = 'neutral'
}) => {
  const toneColor =
    tone === 'success' ? 'text-success'
      : tone === 'amber' ? 'text-amber'
        : tone === 'alert' ? 'text-alert'
          : 'text-text-primary'
  return (
    <div className="card p-4 flex flex-col justify-between min-h-[110px]">
      <span className="eyebrow">{label}</span>
      <div className={`mt-2 ${toneColor}`}>{children}</div>
    </div>
  )
}

const SignalCard: React.FC<{ s: Signal }> = ({ s }) => (
  <div className="card p-3.5 hover:bg-surface-alt/40 transition">
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm font-medium text-text-primary leading-snug">{s.name}</span>
      <span className={`text-base shrink-0 ${s.direction === '↑' ? 'text-success' : s.direction === '↓' ? 'text-alert' : 'text-text-muted'}`}>{s.direction}</span>
    </div>
    <p className="text-xs text-text-muted mt-1.5 leading-relaxed">{s.insight}</p>
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] uppercase tracking-widest text-text-muted">{s.recency}</span>
      {s.isLive && <span className="text-[9px] uppercase tracking-widest text-accent-secondary">live</span>}
      {s.source && <span className="text-[10px] text-text-muted">· {s.source}</span>}
    </div>
  </div>
)

export const CityOverview: React.FC = () => {
  const { city, vertical } = useApp()
  const cityMeta = CITIES.find(c => c.key === city)!
  const isInvestorLed = cityMeta.tier === 'INVESTOR_LED'

  const kpiQ = useQuery({
    queryKey: ['kpi', city, vertical],
    queryFn: () => fetchCityKpi(city, vertical),
    staleTime: STALE_TIMES.static
  })
  const briefQ = useQuery({
    queryKey: ['brief', city, vertical],
    queryFn: () => fetchCityBrief(city, vertical),
    staleTime: STALE_TIMES.static
  })
  const signalsQ = useQuery({
    queryKey: ['signals', city, vertical],
    queryFn: () => fetchLiveSignals(city, vertical),
    staleTime: STALE_TIMES.news
  })
  const currencyQ = useQuery({
    queryKey: ['currency', cityMeta.currency],
    queryFn: () => (cityMeta.currency === 'EUR' ? Promise.resolve(null) : fetchCurrency(cityMeta.currency)),
    staleTime: STALE_TIMES.currency,
    enabled: cityMeta.currency !== 'EUR'
  })
  const weatherQ = useQuery({
    queryKey: ['weather', city],
    queryFn: () => fetchWeather(cityMeta.lat, cityMeta.lon),
    staleTime: STALE_TIMES.weather,
    enabled: vertical === 'PREMIUM_SAUNAS'
  })

  const teamSignalsQ = useQuery({
    queryKey: ['teamSignals', 'city', city],
    queryFn: () => fetchTeamSignalsByCity(city),
    staleTime: 30_000,
  })

  const kpi = kpiQ.data

  const adrLabel = `€${(kpi?.avgADR ?? 0).toLocaleString()}`
  const windowTone = kpi?.acquisitionWindow === 'Open' ? 'success' : kpi?.acquisitionWindow === 'Narrowing' ? 'amber' : 'alert'
  const hnwiTone = kpi?.hnwiConvergence === 'Critical' || kpi?.hnwiConvergence === 'High' ? 'success' : kpi?.hnwiConvergence === 'Medium' ? 'amber' : 'alert'

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div>
        <span className="eyebrow">{isInvestorLed ? 'Investor-Led' : 'Active Rollup'} · {vertical === 'COASTAL_HOTELS' ? 'Coastal Hotels' : 'Premium Saunas'}</span>
        <h1 className="text-3xl font-semibold text-text-primary mt-1">{cityMeta.name}<span className="text-text-muted text-xl ml-2 font-normal">{cityMeta.country}</span></h1>
      </div>

      <section className="grid grid-cols-4 gap-4">
        {kpiQ.isLoading ? (
          <>{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-[110px]" />)}</>
        ) : (
          <>
            <KpiCard label="LMI Score">
              <div className="flex items-center gap-3">
                {kpi && <LmiGauge score={kpi.lmi} size={68} thickness={6} />}
                <div className="flex flex-col">
                  <span className="text-[11px] text-text-muted" title="Oceanvs Lifestyle Market Index — proprietary composite signal.">Composite signal</span>
                  <span className="text-[11px] text-text-muted">out of 100</span>
                </div>
              </div>
            </KpiCard>

            {!isInvestorLed ? (
              <KpiCard label="Active Operators">
                <span className="text-3xl font-semibold">{kpi?.activeOperators}</span>
                <span className="text-[11px] text-text-muted ml-2">in pipeline</span>
              </KpiCard>
            ) : (
              <KpiCard label="HNWI Convergence" tone={hnwiTone}>
                <span className="text-2xl font-semibold">{kpi?.hnwiConvergence}</span>
              </KpiCard>
            )}

            <KpiCard label="Avg ADR">
              <span className="text-3xl font-semibold">{adrLabel}</span>
              <span className="text-[11px] text-text-muted ml-2">{vertical === 'COASTAL_HOTELS' ? 'per night' : 'per session'}</span>
            </KpiCard>

            {!isInvestorLed ? (
              <KpiCard label="Acquisition Window" tone={windowTone}>
                <span className="text-2xl font-semibold">{kpi?.acquisitionWindow}</span>
              </KpiCard>
            ) : (
              <KpiCard label="Investor Readiness">
                <span className="text-3xl font-semibold">{kpi?.investorReadiness}<span className="text-base text-text-muted">/10</span></span>
              </KpiCard>
            )}
          </>
        )}
      </section>

      <section className="grid grid-cols-12 gap-5">
        <div className="col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Active Signals</span>
            {signalsQ.data && !signalsQ.data.live && (
              <span className="text-[10px] text-text-muted">Using cached data</span>
            )}
          </div>
          {signalsQ.isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {weatherQ.data && vertical === 'PREMIUM_SAUNAS' && (
                <SignalCard s={{
                  id: 'live-weather',
                  name: `Sauna Demand Pressure: ${weatherQ.data.pressure.replace('Sauna Demand Pressure', '').trim() || weatherQ.data.pressure}`,
                  insight: `${Math.round(weatherQ.data.tempC)}°C, ${Math.round(weatherQ.data.cloudCover)}% cloud cover. ${weatherQ.data.pressure === 'High Sauna Demand Pressure' ? 'Peak winter demand profile.' : weatherQ.data.pressure === 'Moderate' ? 'Typical shoulder-season conditions.' : 'Off-peak temperature regime.'}`,
                  direction: weatherQ.data.direction,
                  recency: 'today',
                  isLive: true,
                  source: 'Open-Meteo'
                }} />
              )}
              {currencyQ.data && (
                <SignalCard s={{
                  id: 'live-fx',
                  name: `EUR/${currencyQ.data.quote} ${currencyQ.data.rate.toFixed(2)}`,
                  insight: `7d change ${currencyQ.data.weeklyChangePct >= 0 ? '+' : ''}${currencyQ.data.weeklyChangePct.toFixed(2)}%. ${currencyQ.data.weeklyChangePct < 0 ? 'EUR softening favours inbound HNWI travel from EUR markets.' : 'EUR strength reduces inbound from EUR markets.'}`,
                  direction: currencyQ.data.weeklyChangePct < 0 ? '↑' : '↓',
                  recency: 'today',
                  isLive: true,
                  source: 'exchangerate.host'
                }} />
              )}
              {signalsQ.data?.signals.map(s => <SignalCard key={s.id} s={s} />)}
              {teamSignalsQ.data?.map(ts => (
                <SignalCard key={`team-${ts.id}`} s={{
                  id: `team-${ts.id}`,
                  name: ts.title,
                  insight: ts.description || `${ts.asset_class}${ts.tip_source ? ` — via ${ts.tip_source}` : ''}`,
                  direction: '→',
                  recency: new Date(ts.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
                  source: 'Team',
                }} />
              ))}
            </div>
          )}
        </div>

        <div className="col-span-5 flex flex-col gap-3">
          <span className="eyebrow">City Intelligence Brief</span>
          <div className="card p-5">
            {briefQ.isLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <div className="flex flex-col gap-3">
                {briefQ.data?.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-text-primary">{p}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
