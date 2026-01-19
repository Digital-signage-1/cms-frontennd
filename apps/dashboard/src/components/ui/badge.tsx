import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-white border-transparent',
        secondary: 'bg-surface-alt text-text-secondary border-border',
        destructive: 'bg-error text-white border-transparent',
        outline: 'text-text-primary border-border bg-surface',
        success: 'bg-success-light text-success-dark border-transparent',
        warning: 'bg-warning-light text-warning-dark border-transparent',
        error: 'bg-error-light text-error-dark border-transparent',
        info: 'bg-info-light text-info-dark border-transparent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
