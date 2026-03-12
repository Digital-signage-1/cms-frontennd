'use client'

import { useEffect } from 'react'
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { ToastVariant } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

const variantStyles: Record<ToastVariant, { bg: string; border: string; icon: typeof Info; iconColor: string }> = {
  default: {
    bg: 'bg-white',
    border: 'border-[#bae6fd]',
    icon: Info,
    iconColor: 'text-[#0ea5e9]',
  },
  error: {
    bg: 'bg-white',
    border: 'border-[#fca5a5]',
    icon: AlertCircle,
    iconColor: 'text-[#ef4444]',
  },
  success: {
    bg: 'bg-white',
    border: 'border-[#86efac]',
    icon: CheckCircle2,
    iconColor: 'text-[#22c55e]',
  },
}

export function Toaster() {
  const { toasts, dismiss, subscribe } = useToast()

  useEffect(() => {
    return subscribe()
  }, [subscribe])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const style = variantStyles[t.variant]
        const Icon = style.icon
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)]',
              'animate-in slide-in-from-right-full fade-in duration-300',
              style.bg,
              style.border,
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', style.iconColor)} />
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className="text-sm font-semibold text-[#0c4a6e]">{t.title}</p>
              )}
              <p className="text-sm text-[#0369a1]">{t.description}</p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 p-1 rounded-lg hover:bg-[#e0f2fe] text-[#6b7280] hover:text-[#0c4a6e] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
