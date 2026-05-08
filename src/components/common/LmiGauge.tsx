import React from 'react'

interface Props {
  score: number
  size?: number
  thickness?: number
  showLabel?: boolean
}

const colorFor = (s: number): string => {
  if (s <= 40) return 'var(--alert)'
  if (s <= 65) return '#D4A017'
  if (s <= 85) return 'var(--accent-primary)'
  return 'var(--accent-secondary)'
}

export const LmiGauge: React.FC<Props> = ({ score, size = 96, thickness = 8, showLabel = true }) => {
  const radius = (size - thickness) / 2
  const circ = 2 * Math.PI * radius
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circ
  const color = colorFor(score)
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={radius} stroke="var(--surface-alt)" strokeWidth={thickness} fill="none" />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold leading-none" style={{ color }}>{Math.round(score)}</span>
          <span className="text-[9px] uppercase tracking-widest text-text-muted mt-0.5">LMI</span>
        </div>
      )}
    </div>
  )
}
