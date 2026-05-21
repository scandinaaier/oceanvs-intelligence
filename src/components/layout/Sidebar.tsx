import React from 'react'
import { NavLink } from 'react-router-dom'

const NAV = [
  { to: '/dashboard', label: 'City Overview', end: true },
  { to: '/dashboard/intel', label: 'Market Intelligence' },
  { to: '/dashboard/pipeline', label: 'Acquisition Pipeline' },
  { to: '/dashboard/portfolio', label: 'Portfolio Builder' },
  { to: '/dashboard/signals', label: 'Signal Log' },
  { to: '/dashboard/gaps', label: 'Gap Markets' },
  { to: '/dashboard/lmi', label: 'LMI Detail' }
]

export const Sidebar: React.FC = () => (
  <nav className="w-[240px] shrink-0 px-4 py-6">
    <div className="card p-3 sticky top-[120px]">
      <span className="eyebrow block mb-3 px-2">Navigation</span>
      <ul className="flex flex-col gap-0.5">
        {NAV.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm transition ${
                  isActive ? 'bg-accent-primary text-white' : 'hover:bg-surface-alt text-text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  </nav>
)
