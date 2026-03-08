import React, { useId } from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down' | 'neutral'
  }
  icon?: React.ReactNode
  dotColor?: string
  progress?: number
}

export function MetricsStrip({ metrics }: { metrics: MetricCardProps[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  )
}

function Sparkline({ color, uid }: { color: string; uid: string }) {
  const linePoints = '0,28 14,22 28,25 42,14 56,18 70,10 84,16 100,10'
  const areaPoints = `${linePoints} 100,36 0,36`

  return (
    <svg
      width="100%"
      height="36"
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.20" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${uid})`} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricCard({ label, value, change, dotColor = '#0891B2', progress }: MetricCardProps) {
  const uid = useId().replace(/:/g, '-')
  const sparkId = `spark-${uid}`

  const trendColor =
    change?.trend === 'up' ? '#059669' : change?.trend === 'down' ? '#DC2626' : dotColor
  const trendBg =
    change?.trend === 'up'
      ? 'rgba(5,150,105,0.08)'
      : change?.trend === 'down'
      ? 'rgba(220,38,38,0.08)'
      : `${dotColor}15`

  return (
    <div
      className="rounded-xl flex flex-col relative overflow-hidden transition-all duration-200 cursor-default"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #BAE6FD',
        boxShadow: '0 1px 3px rgba(8,145,178,0.06)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Top content area */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3 flex-1">
        {/* Label + dot */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs uppercase font-semibold tracking-widest"
            style={{ color: '#94A3B8', letterSpacing: '0.1em' }}
          >
            {label}
          </span>
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 6px ${dotColor}50`,
            }}
          />
        </div>

        {/* Value */}
        <p className="text-4xl font-bold leading-none tracking-tight" style={{ color: '#0C1A2E' }}>
          {typeof value === 'string' && value.endsWith(' GB') ? (
            <>
              {value.slice(0, -3)}
              <span className="text-2xl font-semibold ml-0.5" style={{ color: '#94A3B8' }}>GB</span>
            </>
          ) : value}
        </p>

        {/* Change badge */}
        {change && (
          <span
            className="self-start inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color: trendColor, backgroundColor: trendBg }}
          >
            {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : ''}
            {change.value}
          </span>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E8F4FB' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: dotColor }}
            />
          </div>
        )}
      </div>

      {/* Sparkline pinned to bottom */}
      <div className="px-0 pb-0 mt-auto">
        <Sparkline color={dotColor} uid={sparkId} />
      </div>
    </div>
  )
}
