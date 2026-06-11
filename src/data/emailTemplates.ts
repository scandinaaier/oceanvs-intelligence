// ─────────────────────────────────────────────────────────────
// Oceanvs Acquisition CRM — Outreach Email Templates
// From: Tauriq Adams, CIO — Oceanvs Group
// ─────────────────────────────────────────────────────────────

import { RollupEmailTemplate } from '../types'

// Available tokens for personalisation:
// {{OPERATOR_NAME}}    — e.g. "KOK Oslo"
// {{OWNER_NAME}}       — e.g. "Lars" / "Tormod"
// {{LOCATION}}         — e.g. "Ålesund" / "Flåm"
// {{WATER_BODY}}       — e.g. "Sognefjord" / "Oslofjord"
// {{FORMAT_DESC}}      — e.g. "floating sauna" / "barrel sauna"
// {{YEAR_EST}}         — e.g. "2019"
// {{NOTABLE_DETAIL}}   — pulled from notes field

export const EMAIL_TEMPLATES: RollupEmailTemplate[] = [
  // ── TIER 1 — MULTI-SITE & BRAND OPERATORS ─────────────────
  {
    id: 'multi-site-acquisition',
    name: 'Multi-Site Brand — Acquisition Conversation',
    segment: 'multi_site',
    subject: 'Oceanvs Group — A conversation about {{OPERATOR_NAME}}',
    tokens: ['OPERATOR_NAME', 'OWNER_NAME', 'LOCATION', 'NOTABLE_DETAIL'],
    body: `Hi {{OWNER_NAME}},

My name is Tauriq Adams. I'm CIO at Oceanvs Group — a Nordic wellness hospitality investment platform currently building a sauna and wellness roll-up across Norway.

I've been watching {{OPERATOR_NAME}} for a while. What you've built — {{NOTABLE_DETAIL}} — is exactly the kind of operator we're looking to partner with or acquire as a platform anchor.

Oceanvs Group is structured as an SPV targeting EUR 50M in capital against a EUR 250M group valuation within five years. The sauna vertical is a core pillar of that thesis. We're not looking to absorb what you've built and strip it down. The goal is the opposite: bring institutional capital and infrastructure behind operations that are already working, and grow them faster.

For an operator like {{OPERATOR_NAME}}, that typically means: capital for fleet expansion or new sites, backend infrastructure for bookings and yield management, and a flag in the group structure that adds asset-level valuation without removing day-to-day control.

I'd like 30 minutes on a call to explain the thesis and hear where you are. No pitch deck. Just a direct conversation between people who understand the space.

Would that be useful?

Tauriq Adams
Chief Information Officer — Oceanvs Group
hello@tauriqadams.com
tauriqadams.com`,
  },

  // ── TIER 2 — SINGLE-SITE FLOATING / WATERFRONT ─────────────
  {
    id: 'single-site-floating',
    name: 'Single-Site Floating — Acquisition Intro',
    segment: 'single_site_floating',
    subject: 'Oceanvs Group — {{OPERATOR_NAME}} and a conversation worth having',
    tokens: ['OPERATOR_NAME', 'OWNER_NAME', 'LOCATION', 'WATER_BODY'],
    body: `Hi {{OWNER_NAME}},

Tauriq Adams here — CIO at Oceanvs Group, a Nordic wellness hospitality platform.

We're building a sauna roll-up across Norway, and {{OPERATOR_NAME}} in {{LOCATION}} is on our list of operators we'd want to understand better.

What you've built on the {{WATER_BODY}} is a real asset — the kind of thing that's worth considerably more inside a consolidated platform than it is standing alone. That's the core of what we're exploring: whether there's a structure that works for you financially while keeping what makes the operation what it is.

I'm not going to oversell this at this stage. The question is simpler: is this a conversation worth having?

If you're open to a 20-minute call, I'll walk you through what Oceanvs Group is doing and what a partnership or acquisition would look like from your side. If it's not the right moment, no harm done.

Either way — what you're doing on the water in {{LOCATION}} is worth noting.

Tauriq Adams
Chief Information Officer — Oceanvs Group
hello@tauriqadams.com`,
  },

  // ── TIER 3 — SINGLE-SITE LAND-BASED ───────────────────────
  {
    id: 'single-site-land',
    name: 'Single-Site Land-Based — Acquisition Intro',
    segment: 'single_site_land',
    subject: 'Oceanvs Group — A question about {{OPERATOR_NAME}}',
    tokens: ['OPERATOR_NAME', 'OWNER_NAME', 'LOCATION', 'FORMAT_DESC'],
    body: `Hi {{OWNER_NAME}},

I'm Tauriq Adams, CIO at Oceanvs Group — a Nordic wellness hospitality investment platform.

We're in the process of building a roll-up of sauna operators across Norway, and {{OPERATOR_NAME}} caught our attention. {{NOTABLE_DETAIL}}

The thesis is straightforward: standalone sauna operations like yours carry more value inside a consolidated platform than they can generate independently. Not because the operation is lacking — the opposite. It's because the infrastructure, capital and distribution of a group structure amplifies what's already working.

I'd like to understand your operation better and share what Oceanvs is building. A 20-minute call is all I'm asking for at this stage.

If you're curious, let me know a time that works.

Tauriq Adams
Chief Information Officer — Oceanvs Group
hello@tauriqadams.com
tauriqadams.com`,
  },

  // ── CAMPSITE TEMPLATE ─────────────────────────────────────
  {
    id: 'campsite-acquisition',
    name: 'Waterfront Campsite — Acquisition Intro',
    segment: 'campsite',
    subject: 'Oceanvs Group — {{OPERATOR_NAME}} and a direct conversation',
    tokens: ['OPERATOR_NAME', 'OWNER_NAME', 'LOCATION', 'WATER_BODY'],
    body: `Hi {{OWNER_NAME}},

My name is Tauriq Adams — CIO at Oceanvs Group, a Nordic wellness hospitality investment platform.

We are actively acquiring waterfront campsites in Norway. {{OPERATOR_NAME}} on the {{WATER_BODY}} near {{LOCATION}} fits the profile of asset we are specifically targeting: waterfront access, privately owned, and in our view currently underpriced relative to the potential of the location.

Oceanvs Group is structured as an SPV with EUR 50M in capital targeting a EUR 250M group valuation within five years. Waterfront campsites are a core acquisition thesis. We move quickly when we find the right site, and we pay fair value with clean deal terms.

I don't want to be vague about intent: we are interested in acquiring or investing in {{OPERATOR_NAME}} if the conditions are right. I'd like 20 minutes to put the offer on the table and hear where you are.

Would that work?

Tauriq Adams
Chief Information Officer — Oceanvs Group
hello@tauriqadams.com
tauriqadams.com`,
  },

  // ── FOLLOW-UP AFTER NO RESPONSE ────────────────────────────
  {
    id: 'follow-up-no-response',
    name: 'Follow-Up — No Response (14 days)',
    segment: 'multi_site',
    subject: 'Re: Oceanvs Group — {{OPERATOR_NAME}}',
    tokens: ['OPERATOR_NAME', 'OWNER_NAME'],
    body: `Hi {{OWNER_NAME}},

Following up on my email from two weeks ago about {{OPERATOR_NAME}}.

I'll keep this short. Oceanvs Group is assembling a Nordic sauna portfolio and we've identified {{OPERATOR_NAME}} as a priority conversation. If the timing isn't right, I understand. But if you have 20 minutes this week or next, I'd make it worth your while.

Tauriq Adams
CIO — Oceanvs Group
hello@tauriqadams.com`,
  },

  // ── POST-MEETING FOLLOW-UP ─────────────────────────────────
  {
    id: 'post-meeting-followup',
    name: 'Post-Meeting — Next Steps',
    segment: 'multi_site',
    subject: 'Following our call — Oceanvs Group / {{OPERATOR_NAME}}',
    tokens: ['OPERATOR_NAME', 'OWNER_NAME'],
    body: `Hi {{OWNER_NAME}},

Good to speak with you.

Following our call, I'll put together a short summary of the structure we discussed and circulate it to you and Lars (our Head of Acquisitions). We'd like to move this forward.

The specific things I'll cover in the note:
— Proposed structure (acquisition vs. partnership)
— Indicative valuation basis
— Next steps toward due diligence

I'll have that to you within 5 working days.

In the meantime — any questions, I'm reachable directly.

Tauriq Adams
CIO — Oceanvs Group
hello@tauriqadams.com`,
  },
]

export function getTemplateBySegment(segment: RollupEmailTemplate['segment']): RollupEmailTemplate[] {
  return EMAIL_TEMPLATES.filter(t => t.segment === segment)
}

export function personaliseEmail(
  template: RollupEmailTemplate,
  tokens: Record<string, string>
): { subject: string; body: string } {
  let subject = template.subject
  let body = template.body

  Object.entries(tokens).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, value)
    body = body.replace(regex, value)
  })

  // Clear any unfilled tokens
  subject = subject.replace(/\{\{[A-Z_]+\}\}/g, '...')
  body = body.replace(/\{\{[A-Z_]+\}\}/g, '...')

  return { subject, body }
}
