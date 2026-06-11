import React, { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSaunaTargets, fetchCampsiteTargets, fetchRecentActivities,
  updateSaunaTarget, updateCampsiteTarget, fmtNok,
} from '../../api/rollup'
import { Skeleton } from '../../components/common/Skeleton'
import { TargetDetailModal } from '../../components/rollup/TargetDetailModal'
import { SeedModeBanner, PriorityDot, STAGE_STYLES, FilterChip } from '../../components/rollup/shared'
import type { SaunaTarget, CampsiteTarget, RollupStage } from '../../types'
import { ROLLUP_STAGES } from '../../types'

type BoardCardData =
  | { kind: 'sauna'; t: SaunaTarget }
  | { kind: 'campsite'; t: CampsiteTarget }

const ACTIVE_STAGES = ROLLUP_STAGES.filter(s => !['acquired', 'passed'].includes(s.id))
const CLOSED_STAGES = ROLLUP_STAGES.filter(s => ['acquired', 'passed'].includes(s.id))

const BoardCard: React.FC<{
  item: BoardCardData
  onClick: () => void
  onStageChange: (stage: RollupStage) => void
  disabled: boolean
}> = ({ item, onClick, onStageChange, disabled }) => {
  const { t, kind } = item
  return (
    <div className="card p-3 hover:shadow-lg transition cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium leading-snug">{t.name}</span>
        <span className="text-[8.5px] uppercase tracking-widest text-text-muted shrink-0 mt-0.5">{kind === 'sauna' ? 'Sauna' : 'Camp'}</span>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] font-medium text-accent-primary">{fmtNok(t.revenue_nok)}</span>
        <PriorityDot priority={t.priority} />
      </div>
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-[9px] text-text-muted truncate">
          {t.assigned_to ? t.assigned_to.split('@')[0] : 'Unassigned'}
          {t.last_contact_at && ` · ${new Date(t.last_contact_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
        </span>
        <select
          value={t.stage}
          disabled={disabled}
          onClick={e => e.stopPropagation()}
          onChange={e => onStageChange(e.target.value as RollupStage)}
          className="text-[9px] uppercase tracking-widest border border-[var(--border)] rounded px-1 py-0.5 bg-white text-text-muted focus:outline-none disabled:opacity-50 shrink-0"
        >
          {ROLLUP_STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </div>
    </div>
  )
}

export const CrmBoard: React.FC = () => {
  const queryClient = useQueryClient()
  const [verticalFilter, setVerticalFilter] = useState<'both' | 'sauna' | 'campsite'>('both')
  const [selected, setSelected] = useState<BoardCardData | null>(null)

  const saunasQ = useQuery({ queryKey: ['rollup', 'saunas'], queryFn: fetchSaunaTargets, staleTime: 30_000 })
  const campsQ = useQuery({ queryKey: ['rollup', 'campsites'], queryFn: fetchCampsiteTargets, staleTime: 30_000 })
  const seedMode = saunasQ.data?.source === 'seed' || campsQ.data?.source === 'seed'

  const actsQ = useQuery({
    queryKey: ['rollup', 'recent-activities'],
    queryFn: () => fetchRecentActivities(12),
    enabled: !seedMode,
    staleTime: 15_000,
  })

  const stageMut = useMutation({
    mutationFn: ({ item, stage }: { item: BoardCardData; stage: RollupStage }) =>
      item.kind === 'sauna'
        ? updateSaunaTarget(item.t.id, { stage })
        : updateCampsiteTarget(item.t.id, { stage }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rollup'] }),
  })

  const items: BoardCardData[] = useMemo(() => {
    const saunas = (saunasQ.data?.targets ?? []).map(t => ({ kind: 'sauna' as const, t }))
    const camps = (campsQ.data?.targets ?? [])
      // campsites only join the board once they've been touched — keeps 4k prospects out of column one
      .filter(t => t.stage !== 'prospect' || t.priority === 'high' || t.assigned_to)
      .map(t => ({ kind: 'campsite' as const, t }))
    let all = [...saunas, ...camps]
    if (verticalFilter !== 'both') all = all.filter(i => i.kind === verticalFilter)
    return all
  }, [saunasQ.data, campsQ.data, verticalFilter])

  const isLoading = saunasQ.isLoading || campsQ.isLoading

  // refresh the selected card from query data so modal edits reflect immediately
  const selectedLive: BoardCardData | null = useMemo(() => {
    if (!selected) return null
    const pool = selected.kind === 'sauna' ? saunasQ.data?.targets : campsQ.data?.targets
    const fresh = pool?.find(t => t.id === selected.t.id)
    return fresh ? ({ kind: selected.kind, t: fresh } as BoardCardData) : selected
  }, [selected, saunasQ.data, campsQ.data])

  return (
    <div className="flex flex-col gap-5 mt-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="eyebrow">Roll-Up Execution</span>
          <h1 className="text-2xl font-semibold mt-1">CRM Board</h1>
        </div>
        <div className="flex gap-1.5">
          <FilterChip active={verticalFilter === 'both'} onClick={() => setVerticalFilter('both')}>Both Verticals</FilterChip>
          <FilterChip active={verticalFilter === 'sauna'} onClick={() => setVerticalFilter('sauna')}>Saunas</FilterChip>
          <FilterChip active={verticalFilter === 'campsite'} onClick={() => setVerticalFilter('campsite')}>Campsites</FilterChip>
        </div>
      </div>

      {seedMode && <SeedModeBanner />}

      {/* Recent team activity */}
      {!seedMode && actsQ.data && actsQ.data.length > 0 && (
        <div className="card p-4">
          <span className="eyebrow block mb-2">Latest Team Outreach</span>
          <div className="flex flex-col gap-1.5">
            {actsQ.data.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center gap-2 text-xs">
                <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-primary/15 text-accent-primary shrink-0">{a.channel.replace('_', ' ')}</span>
                <span className="font-medium text-text-primary shrink-0">{a.actor.split('@')[0]}</span>
                <span className="text-text-muted truncate">{a.summary}</span>
                <span className="text-[10px] text-text-muted ml-auto shrink-0">{new Date(a.occurred_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <>
          {/* Active pipeline columns */}
          <div className="grid grid-cols-5 gap-3">
            {ACTIVE_STAGES.map(stage => {
              const stageItems = items.filter(i => i.t.stage === stage.id)
              const style = STAGE_STYLES[stage.id]
              return (
                <div key={stage.id} className="flex flex-col min-h-[360px]">
                  <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-text-primary">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-semibold text-text-muted">{stageItems.length}</span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {stageItems.map(item => (
                      <BoardCard
                        key={`${item.kind}-${item.t.id}`}
                        item={item}
                        disabled={seedMode}
                        onClick={() => setSelected(item)}
                        onStageChange={s => stageMut.mutate({ item, stage: s })}
                      />
                    ))}
                    {stageItems.length === 0 && (
                      <div className="border border-dashed border-[var(--border)] rounded-xl p-4 text-center text-[10px] uppercase tracking-widest text-text-muted">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Closed row */}
          <div className="grid grid-cols-2 gap-3">
            {CLOSED_STAGES.map(stage => {
              const stageItems = items.filter(i => i.t.stage === stage.id)
              const style = STAGE_STYLES[stage.id]
              return (
                <div key={stage.id}>
                  <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-text-primary">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-semibold text-text-muted">{stageItems.length}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {stageItems.map(item => (
                      <BoardCard
                        key={`${item.kind}-${item.t.id}`}
                        item={item}
                        disabled={seedMode}
                        onClick={() => setSelected(item)}
                        onStageChange={s => stageMut.mutate({ item, stage: s })}
                      />
                    ))}
                    {stageItems.length === 0 && (
                      <div className="border border-dashed border-[var(--border)] rounded-xl p-3 text-center text-[10px] uppercase tracking-widest text-text-muted col-span-3">
                        None
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {selectedLive && (
        <TargetDetailModal
          target={selectedLive}
          seedMode={seedMode}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
