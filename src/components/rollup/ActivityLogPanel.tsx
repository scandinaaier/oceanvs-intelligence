import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchActivities, logActivity } from '../../api/rollup'
import { useAuth } from '../../state/AuthContext'
import type { ActivityChannel, RollupStage } from '../../types'

const CHANNELS: { id: ActivityChannel; label: string }[] = [
  { id: 'email', label: 'Email' },
  { id: 'call', label: 'Call' },
  { id: 'meeting', label: 'Meeting' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'site_visit', label: 'Site Visit' },
  { id: 'note', label: 'Note' },
]

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const ActivityLogPanel: React.FC<{
  targetType: 'sauna' | 'campsite'
  targetId: string
  currentStage: RollupStage
  disabled?: boolean
}> = ({ targetType, targetId, currentStage, disabled }) => {
  const { email } = useAuth()
  const queryClient = useQueryClient()
  const [channel, setChannel] = useState<ActivityChannel>('note')
  const [summary, setSummary] = useState('')

  const actsQ = useQuery({
    queryKey: ['activities', targetType, targetId],
    queryFn: () => fetchActivities(targetType, targetId),
    enabled: !disabled,
    staleTime: 15_000,
  })

  const addMut = useMutation({
    mutationFn: () => logActivity({
      target_type: targetType,
      target_id: targetId,
      actor: email ?? 'unknown',
      channel,
      summary: summary.trim(),
      stage_at_time: currentStage,
    }),
    onSuccess: () => {
      setSummary('')
      queryClient.invalidateQueries({ queryKey: ['activities', targetType, targetId] })
      queryClient.invalidateQueries({ queryKey: ['rollup'] })
    },
  })

  return (
    <div>
      <span className="eyebrow block mb-2">Outreach Log</span>

      {disabled ? (
        <p className="text-xs text-text-muted italic">Activity logging requires the shared database (migration 006).</p>
      ) : (
        <>
          <div className="flex gap-2 mb-3">
            <select
              value={channel}
              onChange={e => setChannel(e.target.value as ActivityChannel)}
              className="border border-[var(--border)] rounded-lg px-2 py-1.5 text-[11px] uppercase tracking-widest bg-white text-[var(--text-muted)] focus:outline-none shrink-0"
            >
              {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <input
              value={summary}
              onChange={e => setSummary(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && summary.trim() && addMut.mutate()}
              placeholder="What happened? (e.g. Sent intro email, spoke to owner...)"
              className="flex-1 border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
            />
            <button
              onClick={() => summary.trim() && addMut.mutate()}
              disabled={!summary.trim() || addMut.isPending}
              className="btn-primary disabled:opacity-50"
            >
              Log
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {actsQ.isLoading && <p className="text-xs text-text-muted">Loading…</p>}
            {actsQ.data?.length === 0 && <p className="text-xs text-text-muted italic">No outreach logged yet. First touch wins the deal.</p>}
            {actsQ.data?.map(a => (
              <div key={a.id} className="bg-[var(--surface-alt)] rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded bg-accent-primary/15 text-accent-primary">{a.channel.replace('_', ' ')}</span>
                  <span className="text-[10px] text-text-muted">{fmtWhen(a.occurred_at)}</span>
                  <span className="text-[10px] text-text-primary font-medium">{a.actor}</span>
                </div>
                <p className="text-xs text-text-primary mt-1">{a.summary}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
