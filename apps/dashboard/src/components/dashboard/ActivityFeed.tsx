import React from 'react'

interface ActivityItem {
  id: string
  type: 'player' | 'channel' | 'schedule' | 'content'
  message: string
  timestamp: Date
  icon?: React.ReactNode
}

const TYPE_COLORS: Record<ActivityItem['type'], string> = {
  player: '#34D399',   // green
  channel: '#818CF8',  // indigo/purple
  schedule: '#F5A624', // amber
  content: '#34D399',  // green
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  const hrs = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm" style={{ color: '#6B7280' }}>No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const dotColor = TYPE_COLORS[activity.type]
        return (
          <div key={activity.id} className="flex items-start gap-3">
            {/* Concentric dot: outer ring + inner filled dot */}
            <div className="flex-shrink-0 mt-1 w-4 h-4 relative flex items-center justify-center">
              <div
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: dotColor, opacity: 0.18 }}
              />
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dotColor, boxShadow: `0 0 4px ${dotColor}` }}
              />
            </div>

            {/* Message + timestamp */}
            <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
              <p className="text-sm leading-snug" style={{ color: '#E5E7EB' }}>
                {activity.message}
              </p>
              <span
                className="text-xs flex-shrink-0 mt-0.5"
                style={{ color: '#6B7280' }}
              >
                {formatTimeAgo(activity.timestamp)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
