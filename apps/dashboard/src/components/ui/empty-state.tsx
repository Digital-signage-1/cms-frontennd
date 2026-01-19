import { Button } from './button'
import React from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  visual?: React.ReactNode
}

export function EmptyState({ title, description, action, visual }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {visual && (
        <div className="mb-6">
          {visual}
        </div>
      )}
      <h3 className="text-xl font-semibold text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-text-secondary text-center max-w-md mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="gap-2">
          {action.icon}
          {action.label}
        </Button>
      )}
    </div>
  )
}
