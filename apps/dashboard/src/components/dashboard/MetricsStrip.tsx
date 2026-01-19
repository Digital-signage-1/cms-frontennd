import React from 'react'

interface MetricCardProps {
  label: string
  value: string | number
  change?: {
    value: string
    trend: 'up' | 'down'
  }
  icon?: React.ReactNode
}

export function MetricsStrip({ metrics }: { metrics: MetricCardProps[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  )
}

function MetricCard({ label, value, change, icon }: MetricCardProps) {
  return (
    <div className="border border-border rounded-lg p-4 bg-surface hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs uppercase tracking-wider text-text-muted font-medium">
          {label}
        </span>
        {icon && <div className="text-text-muted">{icon}</div>}
      </div>
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
      {change && (
        <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${
          change.trend === 'up' ? 'text-success' : 'text-error'
        }`}>
          <span>{change.trend === 'up' ? '↑' : '↓'}</span>
          <span>{change.value}</span>
        </div>
      )}
    </div>
  )
}
