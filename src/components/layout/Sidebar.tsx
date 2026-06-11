import React from 'react'
import { NavLink } from 'react-router-dom'

const PRIMARY_NAV = [
  { to: '/dashboard', label: 'City Overview', end: true },
  { to: '/dashboard/pipeline', label: 'Campsite Pipeline' },
  { to: '/dashboard/signals', label: 'Signal Log' },
  { to: '/dashboard/intel', label: 'Market Intelligence' },
]

const ROLLUP_NAV = [
  { to: '/dashboard/saunas', label: 'Sauna Registry' },
  { to: '/dashboard/campsites', label: 'Campsite Registry' },
  { to: '/dashboard/deployment', label: 'Cabin Deployment' },
  { to: '/dashboard/crm', label: 'CRM Board' },
]

const SECONDARY_NAV = [
  { to: '/dashboard/operators', label: 'Operator Pipeline' },
  { to: '/dashboard/portfolio', label: 'Portfolio Builder' },
  { to: '/dashboard/gaps', label: 'Gap Markets' },
  { to: '/dashboard/lmi', label: 'LMI Detail' },
]

const NavItem: React.FC<{ to: string; label: string; end?: boolean }> = ({ to, label, end }) => (
  <li>
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-sm transition ${
          isActive ? 'bg-accent-primary text-white' : 'hover:bg-surface-alt text-text-primary'
        }`
      }
    >
      {label}
    </NavLink>
  </li>
)

export const Sidebar: React.FC = () => (
  <nav className="w-[240px] shrink-0 px-4 py-6">
    <div className="card p-3 sticky top-[120px]">
      <span className="eyebrow block mb-3 px-2">Acquisition</span>
      <ul className="flex flex-col gap-0.5">
        {PRIMARY_NAV.map(item => <NavItem key={item.to} {...item} />)}
      </ul>

      <div className="border-t border-[var(--border)] my-3" />

      <span className="eyebrow block mb-3 px-2">Roll-Up CRM</span>
      <ul className="flex flex-col gap-0.5">
        {ROLLUP_NAV.map(item => <NavItem key={item.to} {...item} />)}
      </ul>

      <div className="border-t border-[var(--border)] my-3" />

      <span className="eyebrow block mb-3 px-2">Intelligence</span>
      <ul className="flex flex-col gap-0.5">
        {SECONDARY_NAV.map(item => <NavItem key={item.to} {...item} />)}
      </ul>
    </div>
  </nav>
)
