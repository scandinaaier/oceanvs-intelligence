import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchCampsites, updateCampsite, seedCampsites } from '../../api/campsitePipeline'
import { useAuth } from '../../state/AuthContext'
import { Skeleton } from '../../components/common/Skeleton'
import type { CampsiteListing } from '../../api/campsitePipeline'

// ── Helpers ───────────────────────────────────────────────
function fmtNok(n: number): string {
  if (!n) return 'POA'
  if (n >= 1_000_000) return `NOK ${(n / 1_000_000).toFixed(1)}M`
  return `NOK ${n.toLocaleString('no-NO')}`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const STATUS_OPTIONS = ['new', 'watching', 'contacted', 'active', 'passed'] as const
type Status = typeof STATUS_OPTIONS[number]

const STATUS_COLORS: Record<Status, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  watching: 'bg-amber-50 text-amber-700 border-amber-200',
  contacted: 'bg-green-50 text-green-700 border-green-200',
  active: 'bg-emerald-50 text-emerald-800 border-emerald-300',
  passed: 'bg-gray-50 text-gray-400 border-gray-200',
}

// ── Site Card ─────────────────────────────────────────────
const SiteCard: React.FC<{
  site: CampsiteListing
  selected: boolean
  onClick: () => void
}> = ({ site, selected, onClick }) => (
  <div
    className={`card overflow-hidden cursor-pointer transition-all hover:shadow-lg ${selected ? 'ring-2 ring-[var(--accent-primary)]' : ''}`}
    onClick={onClick}
  >
    {/* Hero image */}
    {site.images.length > 0 ? (
      <div className="h-40 overflow-hidden bg-gray-100">
        <img
          src={site.images[0]}
          alt={site.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    ) : (
      <div className="h-40 bg-[var(--surface-alt)] flex items-center justify-center">
        <span className="text-3xl opacity-30">🏕️</span>
      </div>
    )}

    <div className="p-3.5">
      {/* Region + status */}
      <div className="flex items-center justify-between mb-1.5">
        {site.region && (
          <span className="text-[10px] uppercase tracking-widest text-[var(--accent-primary)] font-medium">{site.region}</span>
        )}
        <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${STATUS_COLORS[site.status]}`}>
          {site.status}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-[var(--text-primary)] leading-snug line-clamp-2 mb-2">
        {site.title}
      </h3>

      {/* Price + location */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--accent-primary)]">{fmtNok(site.price_nok)}</span>
        {site.location && (
          <span className="text-[10px] text-[var(--text-muted)] truncate max-w-[50%]">{site.location.split(',')[0]}</span>
        )}
      </div>
    </div>
  </div>
)

// ── Detail Modal ──────────────────────────────────────────
const DetailModal: React.FC<{
  site: CampsiteListing
  onClose: () => void
  onStatusChange: (status: Status) => void
  onNotesChange: (notes: string) => void
}> = ({ site, onClose, onStatusChange, onNotesChange }) => {
  const [activeImg, setActiveImg] = useState(0)
  const [notes, setNotes] = useState(site.notes || '')

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto pt-8 pb-8" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-[800px] border border-[var(--border)] my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Hero image + thumbnails */}
        {site.images.length > 0 && (
          <div className="relative">
            <img
              src={site.images[activeImg]}
              alt={site.title}
              className="w-full h-[360px] object-cover rounded-t-xl"
            />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center text-lg leading-none hover:bg-black/70"
            >
              &times;
            </button>
            {/* Thumbnail strip */}
            {site.images.length > 1 && (
              <div className="flex gap-1.5 p-2 bg-black/20 absolute bottom-0 left-0 right-0">
                {site.images.slice(0, 8).map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-12 h-9 rounded overflow-hidden border-2 transition ${i === activeImg ? 'border-white' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div>
            {site.region && (
              <span className="text-[11px] uppercase tracking-widest text-[var(--accent-primary)] font-medium">{site.region}</span>
            )}
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mt-1 leading-snug">{site.title}</h2>
            {site.location && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{site.location}</p>
            )}
          </div>

          {/* Price + key details */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-3">
              <span className="eyebrow">Asking Price</span>
              <div className="text-xl font-semibold text-[var(--accent-primary)] mt-1">{fmtNok(site.price_nok)}</div>
            </div>
            {site.plot_size && (
              <div className="card p-3">
                <span className="eyebrow">Plot Size</span>
                <div className="text-lg font-semibold text-[var(--text-primary)] mt-1">{site.plot_size}</div>
              </div>
            )}
            {site.pitches && (
              <div className="card p-3">
                <span className="eyebrow">Pitches</span>
                <div className="text-lg font-semibold text-[var(--text-primary)] mt-1">{site.pitches}</div>
              </div>
            )}
          </div>

          {/* Description */}
          {site.description && (
            <div>
              <span className="eyebrow block mb-2">Description</span>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{site.description}</p>
            </div>
          )}

          {/* Pipeline status */}
          <div>
            <span className="eyebrow block mb-2">Pipeline Status</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(s)}
                  className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest border transition ${
                    site.status === s
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                      : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent-mid)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <span className="eyebrow block mb-2">Internal Notes</span>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => onNotesChange(notes)}
              placeholder="Investment thesis, contact details, next steps..."
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            {site.url ? (
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex items-center gap-2"
              >
                View on Finn.no ↗
              </a>
            ) : (
              <span />
            )}
            {site.finnkode && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(site.url || '')
                  // Could add a toast here
                }}
                className="btn-secondary text-xs"
              >
                Copy Link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────
export const CampsitePipeline: React.FC = () => {
  const { email } = useAuth()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [regionFilter, setRegionFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priceFilter, setPriceFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<'newest' | 'price_asc' | 'price_desc'>('newest')

  const campsitesQ = useQuery({
    queryKey: ['campsites'],
    queryFn: fetchCampsites,
    staleTime: 30_000,
  })

  const updateMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CampsiteListing> }) => updateCampsite(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campsites'] }),
  })

  const seedMut = useMutation({
    mutationFn: async () => {
      const res = await fetch('/campsite_seed.json')
      const data = await res.json()
      return seedCampsites(data.map((d: any) => ({ ...d, added_by: email })))
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campsites'] }),
  })

  const sites = campsitesQ.data ?? []
  const selectedSite = sites.find(s => s.id === selectedId)

  // Dynamic region list
  const regions = useMemo(() => {
    const set = new Set(sites.map(s => s.region).filter(Boolean) as string[])
    return ['All', ...Array.from(set).sort()]
  }, [sites])

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = [...sites]
    if (regionFilter !== 'All') list = list.filter(s => s.region === regionFilter)
    if (statusFilter !== 'All') list = list.filter(s => s.status === statusFilter)
    if (priceFilter === 'poa') list = list.filter(s => !s.price_nok)
    else if (priceFilter === 'under5m') list = list.filter(s => s.price_nok > 0 && s.price_nok < 5_000_000)
    else if (priceFilter === '5m-10m') list = list.filter(s => s.price_nok >= 5_000_000 && s.price_nok < 10_000_000)
    else if (priceFilter === '10m-20m') list = list.filter(s => s.price_nok >= 10_000_000 && s.price_nok < 20_000_000)
    else if (priceFilter === 'over20m') list = list.filter(s => s.price_nok >= 20_000_000)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.region?.toLowerCase().includes(q) ||
        s.notes?.toLowerCase().includes(q)
      )
    }
    if (sortMode === 'price_asc') list.sort((a, b) => (a.price_nok || 0) - (b.price_nok || 0))
    else if (sortMode === 'price_desc') list.sort((a, b) => (b.price_nok || 0) - (a.price_nok || 0))
    else list.sort((a, b) => new Date(b.added_at).getTime() - new Date(a.added_at).getTime())
    return list
  }, [sites, regionFilter, statusFilter, priceFilter, search, sortMode])

  // Stats
  const totalValue = sites.reduce((s, c) => s + (c.price_nok || 0), 0)
  const avgPrice = sites.length > 0 ? totalValue / sites.length : 0
  const activeCount = sites.filter(s => ['watching', 'contacted', 'active'].includes(s.status)).length

  return (
    <div className="flex flex-col gap-5 mt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Acquisition Pipeline</span>
          <h1 className="text-2xl font-semibold mt-1">Campsite Pipeline</h1>
        </div>
        {sites.length === 0 && !campsitesQ.isLoading && (
          <button
            onClick={() => seedMut.mutate()}
            className="btn-primary"
            disabled={seedMut.isPending}
          >
            {seedMut.isPending ? 'Importing...' : 'Import Scraped Data'}
          </button>
        )}
      </div>

      {/* Stats bar */}
      <section className="grid grid-cols-4 gap-4">
        <div className="card p-4">
          <span className="eyebrow">Total Sites</span>
          <div className="text-3xl font-semibold text-[var(--text-primary)] mt-2">{sites.length}</div>
        </div>
        <div className="card p-4">
          <span className="eyebrow">Active Pipeline</span>
          <div className="text-3xl font-semibold text-[var(--accent-primary)] mt-2">{activeCount}</div>
        </div>
        <div className="card p-4">
          <span className="eyebrow">Total Listed Value</span>
          <div className="text-2xl font-semibold text-[var(--text-primary)] mt-2">{fmtNok(totalValue)}</div>
        </div>
        <div className="card p-4">
          <span className="eyebrow">Avg Asking Price</span>
          <div className="text-2xl font-semibold text-[var(--text-primary)] mt-2">{fmtNok(Math.round(avgPrice))}</div>
        </div>
      </section>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-4">
          {/* Region filters */}
          <div className="flex flex-wrap gap-1">
            {regions.map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest transition ${
                  regionFilter === r
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {r === 'All' ? 'All Regions' : r}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-widest bg-white text-[var(--text-muted)] focus:outline-none"
          >
            <option value="All">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Price filter */}
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-widest bg-white text-[var(--text-muted)] focus:outline-none"
          >
            <option value="all">All Prices</option>
            <option value="under5m">Under NOK 5M</option>
            <option value="5m-10m">NOK 5M – 10M</option>
            <option value="10m-20m">NOK 10M – 20M</option>
            <option value="over20m">NOK 20M+</option>
            <option value="poa">POA Only</option>
          </select>

          {/* Sort */}
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value as any)}
            className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-[11px] uppercase tracking-widest bg-white text-[var(--text-muted)] focus:outline-none"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>

        <input
          type="search"
          placeholder="Search pipeline..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
        />
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">{filtered.length} site{filtered.length !== 1 ? 's' : ''} in view</span>
      </div>

      {/* Card grid */}
      {campsitesQ.isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            {sites.length === 0
              ? 'No campsites in the pipeline yet. Import scraped data or add sites via Signal Capture.'
              : 'No sites match your current filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map(site => (
            <SiteCard
              key={site.id}
              site={site}
              selected={selectedId === site.id}
              onClick={() => setSelectedId(site.id)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedSite && (
        <DetailModal
          site={selectedSite}
          onClose={() => setSelectedId(null)}
          onStatusChange={status => {
            updateMut.mutate({ id: selectedSite.id, updates: { status } })
          }}
          onNotesChange={notes => {
            updateMut.mutate({ id: selectedSite.id, updates: { notes } })
          }}
        />
      )}
    </div>
  )
}
