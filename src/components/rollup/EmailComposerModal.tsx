import React, { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { EMAIL_TEMPLATES } from '../../data/emailTemplates'
import { logActivity } from '../../api/rollup'
import { useAuth } from '../../state/AuthContext'
import type { RollupStage } from '../../types'

export interface ComposerTarget {
  targetType: 'sauna' | 'campsite'
  targetId: string
  name: string
  contactEmail: string | null
  contactName: string | null
  location: string | null
  waterBody: string | null
  formatDesc: string | null
  yearEst: string | null
  notableDetail: string | null
  stage: RollupStage
}

function fillTokens(text: string, t: ComposerTarget): string {
  const tokens: Record<string, string> = {
    OPERATOR_NAME: t.name,
    OWNER_NAME: t.contactName?.split(' ')[0] ?? 'there',
    LOCATION: t.location ?? 'your location',
    WATER_BODY: t.waterBody ?? 'the water',
    FORMAT_DESC: t.formatDesc?.toLowerCase() ?? 'sauna',
    YEAR_EST: t.yearEst ?? '',
    NOTABLE_DETAIL: t.notableDetail ?? 'the operation you run',
  }
  let out = text
  for (const [key, value] of Object.entries(tokens)) {
    out = out.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return out
}

export const EmailComposerModal: React.FC<{
  target: ComposerTarget
  onClose: () => void
  onStageAdvance?: (stage: RollupStage) => void
  disabled?: boolean
}> = ({ target, onClose, onStageAdvance, disabled }) => {
  const { email: actorEmail } = useAuth()
  const queryClient = useQueryClient()

  const defaultTemplate = target.targetType === 'campsite'
    ? EMAIL_TEMPLATES.find(t => t.segment === 'campsite') ?? EMAIL_TEMPLATES[0]
    : EMAIL_TEMPLATES[0]

  const [templateId, setTemplateId] = useState(defaultTemplate.id)
  const template = EMAIL_TEMPLATES.find(t => t.id === templateId) ?? defaultTemplate

  const [to, setTo] = useState(target.contactEmail ?? '')
  const filled = useMemo(() => ({
    subject: fillTokens(template.subject, target),
    body: fillTokens(template.body, target),
  }), [template, target])

  const [subject, setSubject] = useState(filled.subject)
  const [body, setBody] = useState(filled.body)
  const [copied, setCopied] = useState(false)

  // Re-fill when template changes
  const pickTemplate = (id: string) => {
    setTemplateId(id)
    const t = EMAIL_TEMPLATES.find(x => x.id === id)
    if (t) {
      setSubject(fillTokens(t.subject, target))
      setBody(fillTokens(t.body, target))
    }
  }

  const logMut = useMutation({
    mutationFn: () => logActivity({
      target_type: target.targetType,
      target_id: target.targetId,
      actor: actorEmail ?? 'unknown',
      channel: 'email',
      summary: `Outreach email sent — "${subject}"${to ? ` to ${to}` : ''}`,
      stage_at_time: target.stage,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities', target.targetType, target.targetId] })
      queryClient.invalidateQueries({ queryKey: ['rollup'] })
      if (target.stage === 'prospect') onStageAdvance?.('outreach_sent')
    },
  })

  const openMailClient = () => {
    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
    if (!disabled) logMut.mutate()
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(`To: ${to}\nSubject: ${subject}\n\n${body}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 backdrop-blur-sm overflow-y-auto pt-8 pb-8" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-[680px] border border-[var(--border)] my-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="eyebrow">Outreach Composer</span>
            <h2 className="text-lg font-semibold mt-0.5">{target.name}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--surface-alt)] text-text-muted hover:text-text-primary text-lg leading-none">&times;</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <span className="eyebrow block mb-2">Template</span>
            <div className="flex flex-wrap gap-1.5">
              {EMAIL_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => pickTemplate(t.id)}
                  className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest border transition ${
                    templateId === t.id
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                      : 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--accent-mid)]'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="eyebrow block mb-1">To</label>
              <input
                value={to}
                onChange={e => setTo(e.target.value)}
                placeholder="owner@operator.no"
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              />
            </div>
            <div>
              <label className="eyebrow block mb-1">Subject</label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              />
            </div>
            <div>
              <label className="eyebrow block mb-1">Body</label>
              <textarea
                rows={12}
                value={body}
                onChange={e => setBody(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/30"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <span className="text-[10px] text-text-muted">
              {disabled ? 'Seed mode — sending opens your mail client, but nothing is logged.' : 'Opening your mail client logs this as outreach and advances new prospects.'}
            </span>
            <div className="flex gap-2">
              <button onClick={copyAll} className="btn-secondary">{copied ? 'Copied ✓' : 'Copy'}</button>
              <button onClick={openMailClient} className="btn-primary">Open in Mail Client</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
