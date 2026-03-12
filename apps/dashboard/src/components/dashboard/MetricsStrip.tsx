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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  )
}

// Each metric has a "fill %" for the arc gauge — gives visual weight
const ARC_FILL: Record<string, number> = {
  Players:  72,
  Channels: 58,
  Content:  45,
  Storage:  65,
}

function ArcGauge({ color, uid, label, progress }: { color: string; uid: string; label: string; progress?: number }) {
  const fill = progress ?? ARC_FILL[label] ?? 50
  const size = 64
  const strokeW = 5
  const r = (size - strokeW) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  // Show 270° arc (75% of circle), open at bottom
  const arcLen = circumference * 0.75
  const dashFilled = (fill / 100) * arcLen
  const rotation = 135 // start from bottom-left

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <defs>
        <linearGradient id={`${uid}-arc`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </linearGradient>
        <filter id={`${uid}-shadow`}>
          <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={color} floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#e0f2fe"
        strokeWidth={strokeW}
        strokeDasharray={`${arcLen} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(${rotation} ${cx} ${cy})`}
      />

      {/* Filled arc */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={`url(#${uid}-arc)`}
        strokeWidth={strokeW}
        strokeDasharray={`${dashFilled} ${circumference}`}
        strokeLinecap="round"
        transform={`rotate(${rotation} ${cx} ${cy})`}
        filter={`url(#${uid}-shadow)`}
      >
        <animate
          attributeName="stroke-dasharray"
          from={`0 ${circumference}`}
          to={`${dashFilled} ${circumference}`}
          dur="0.8s"
          fill="freeze"
          calcMode="spline"
          keySplines="0.25 0.46 0.45 0.94"
          keyTimes="0;1"
        />
      </circle>

      {/* Center percentage text */}
      <text
        x={cx}
        y={cy - 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight="700"
        fill="#0c4a6e"
      >
        {fill}%
      </text>
    </svg>
  )
}

function MetricCard({ label, value, change, dotColor = '#0ea5e9', progress }: MetricCardProps) {
  const uid = useId().replace(/:/g, '-')

  const trendColor =
    change?.trend === 'up' ? '#059669' : change?.trend === 'down' ? '#DC2626' : '#6b7280'
  const trendBg =
    change?.trend === 'up'
      ? 'rgba(5,150,105,0.08)'
      : change?.trend === 'down'
      ? 'rgba(220,38,38,0.08)'
      : 'rgba(107,114,128,0.08)'

  return (
    <div
      className="rounded-xl relative overflow-hidden transition-all duration-200 group"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #bae6fd',
        boxShadow: '0 1px 3px rgba(14,165,233,0.06)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(14,165,233,0.14), 0 2px 6px rgba(0,0,0,0.04)'
        ;(e.currentTarget as HTMLElement).style.borderColor = dotColor
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(14,165,233,0.06)'
        ;(e.currentTarget as HTMLElement).style.borderColor = '#bae6fd'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      {/* Accent top stripe */}
      <div
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, ${dotColor}, ${dotColor}60, transparent)` }}
      />

      {/* Main layout: left text + right arc */}
      <div className="flex items-center justify-between px-4 py-3.5">
        {/* Left: label, value, change */}
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className="text-[11px] uppercase font-semibold tracking-wider"
            style={{ color: '#6b7280' }}
          >
            {label}
          </span>

          <p className="text-2xl font-bold leading-none tracking-tight" style={{ color: '#0c4a6e' }}>
            {typeof value === 'string' && value.endsWith(' GB') ? (
              <>
                {value.slice(0, -3)}
                <span className="text-sm font-semibold ml-0.5" style={{ color: '#6b7280' }}>GB</span>
              </>
            ) : value}
          </p>

          {change && (
            <span
              className="self-start inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: trendColor, backgroundColor: trendBg }}
            >
              {change.trend === 'up' ? '↑' : change.trend === 'down' ? '↓' : ''}
              {change.value}
            </span>
          )}
        </div>

        {/* Right: arc gauge */}
        <ArcGauge color={dotColor} uid={uid} label={label} progress={progress} />
      </div>
    </div>
  )
}
