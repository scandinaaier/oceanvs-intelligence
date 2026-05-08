import React from 'react'

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-surface-alt rounded ${className}`} />
)

export const ErrorCard: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'Could not load data.',
  onRetry
}) => (
  <div className="card p-4 flex items-center justify-between">
    <span className="text-sm text-text-muted">{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="btn-secondary text-xs">
        Retry
      </button>
    )}
  </div>
)
