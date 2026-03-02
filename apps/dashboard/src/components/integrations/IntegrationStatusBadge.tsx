import { cn } from '@/lib/utils'
import type { IntegrationStatus } from '@signage/types'

const STATUS_CONFIG: Record<
  IntegrationStatus,
  { label: string; className: string; dotClassName: string }
> = {
  active: {
    label: 'Connected',
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dotClassName: 'bg-emerald-400',
  },
  expired: {
    label: 'Token Expired',
    className: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dotClassName: 'bg-amber-400',
  },
  error: {
    label: 'Error',
    className: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dotClassName: 'bg-red-400',
  },
  disconnected: {
    label: 'Disconnected',
    className: 'bg-surface-alt text-text-muted border border-border',
    dotClassName: 'bg-text-muted',
  },
}

interface IntegrationStatusBadgeProps {
  status: IntegrationStatus
  size?: 'sm' | 'md'
}

export function IntegrationStatusBadge({
  status,
  size = 'md',
}: IntegrationStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.disconnected
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dotClassName)} />
      {config.label}
    </span>
  )
}
