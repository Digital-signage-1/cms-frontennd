'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { ToastVariant } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: typeof Info; iconColor: string }> = {
  default: {
    bg: 'bg-surface',
    border: 'border-border',
    icon: Info,
    iconColor: 'text-primary',
  },
  error: {
    bg: 'bg-surface',
    border: 'border-error/40',
    icon: AlertCircle,
    iconColor: 'text-error',
  },
  success: {
    bg: 'bg-surface',
    border: 'border-success/40',
    icon: CheckCircle2,
    iconColor: 'text-success',
  },
}

export function Toaster() {
  const { toasts, dismiss, subscribe } = useToast()

  useEffect(() => {
    return subscribe()
  }, [subscribe])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
      {toasts.map((t) => {
        const style = variantStyles[t.variant]
        const Icon = style.icon
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-2xl border p-4',
              'animate-in slide-in-from-right-full fade-in duration-300',
              style.bg,
              style.border,
            )}
            style={{ boxShadow: 'var(--shadow-elevated)' }}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', style.iconColor)} />
            <div className="min-w-0 flex-1">
              {t.title && (
                <p className="text-sm font-semibold text-text-primary">{t.title}</p>
              )}
              <p className="text-sm text-text-secondary">{t.description}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
