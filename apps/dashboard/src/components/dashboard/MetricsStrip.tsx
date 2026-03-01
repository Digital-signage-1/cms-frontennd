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
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${uid})`} />
      <polyline
        points={linePoints}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MetricCard({ label, value, change, dotColor = '#F5A624', progress }: MetricCardProps) {
  const uid = useId().replace(/:/g, '-')
  const sparkId = `spark-${uid}`

  const trendColor =
    change?.trend === 'up' ? '#34D399' : change?.trend === 'down' ? '#F87171' : dotColor
  const trendBg =
    change?.trend === 'up'
      ? 'rgba(52,211,153,0.12)'
      : change?.trend === 'down'
      ? 'rgba(248,113,113,0.12)'
      : `${dotColor}20`

  return (
    <div
      className="rounded-xl flex flex-col relative overflow-hidden"
      style={{ backgroundColor: '#1C1C1C', border: '1px solid #242424' }}
    >
      {/* Top content area */}
      <div className="px-4 pt-4 pb-3 flex flex-col gap-3 flex-1">
        {/* Label + dot */}
        <div className="flex items-center justify-between">
          <span
            className="text-xs uppercase font-semibold tracking-widest"
            style={{ color: '#4B5563', letterSpacing: '0.1em' }}
          >
            {label}
          </span>
          <div
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: dotColor,
              boxShadow: `0 0 8px ${dotColor}70`,
            }}
          />
        </div>

        {/* Value */}
        <p className="text-4xl font-bold leading-none tracking-tight" style={{ color: '#FFFFFF' }}>
          {typeof value === 'string' && value.endsWith(' GB') ? (
            <>
              {value.slice(0, -3)}
              <span className="text-2xl font-semibold ml-0.5" style={{ color: '#9CA3AF' }}>GB</span>
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

        {/* Progress bar (e.g. storage) */}
        {progress !== undefined && (
          <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
            <div
              className="h-full rounded-full"
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
