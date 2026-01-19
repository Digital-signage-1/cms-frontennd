export const STATUS_COLORS = {
  online: 'bg-success',
  offline: 'bg-text-muted',
  pending: 'bg-warning',
  error: 'bg-error',
} as const

interface StatusDotProps {
  status: keyof typeof STATUS_COLORS
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_CLASSES = {
  sm: 'h-1.5 w-1.5',
  md: 'h-2 w-2',
  lg: 'h-3 w-3',
}

export function StatusDot({ status, pulse = false, size = 'md' }: StatusDotProps) {
  return (
    <div 
      className={`rounded-full ${STATUS_COLORS[status]} ${SIZE_CLASSES[size]} ${pulse ? 'animate-pulse' : ''}`}
    />
  )
}
