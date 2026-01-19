import React from 'react'

interface ActivityItem {
  id: string
  type: 'player' | 'channel' | 'schedule' | 'content'
  message: string
  timestamp: Date
  icon?: React.ReactNode
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)
  const diffInHours = Math.floor(diffInMs / 3600000)
  const diffInDays = Math.floor(diffInMs / 86400000)

  if (diffInMinutes < 1) return 'just now'
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-text-muted">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3 items-start">
          <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary">
              {activity.message}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {formatTimeAgo(activity.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
