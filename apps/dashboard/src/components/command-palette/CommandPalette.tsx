'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Command {
  id: string
  label: string
  category: 'recent' | 'action' | 'navigation'
  action: () => void
  shortcut?: string
}

const CATEGORY_LABEL: Record<string, string> = {
  recent:     'Recent',
  action:     'Actions',
  navigation: 'Navigation',
}

export function CommandPalette() {
  const [open, setOpen]     = useState(false)
  const [search, setSearch] = useState('')
  const [active, setActive] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); setOpen(o => !o) }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const commands: Command[] = [
    { id: 'recent-1', label: 'Lobby Display',    category: 'recent',     action: () => router.push('/players') },
    { id: 'recent-2', label: 'Product Showcase', category: 'recent',     action: () => router.push('/apps')    },
    { id: 'action-1', label: 'Create new channel', category: 'action',   action: () => router.push('/channels/new'), shortcut: '⌘ Shift C' },
    { id: 'action-2', label: 'Upload content',     category: 'action',   action: () => router.push('/content'),     shortcut: '⌘ Shift U' },
    { id: 'action-3', label: 'Register player',    category: 'action',   action: () => router.push('/players'),     shortcut: '⌘ Shift P' },
    { id: 'nav-1',    label: 'Go to Channels',     category: 'navigation', action: () => router.push('/channels'), shortcut: 'G C' },
    { id: 'nav-2',    label: 'Go to Players',      category: 'navigation', action: () => router.push('/players'),  shortcut: 'G P' },
    { id: 'nav-3',    label: 'Go to Settings',     category: 'navigation', action: () => router.push('/settings'), shortcut: 'G S' },
  ]

  const filtered = commands.filter(c => c.label.toLowerCase().includes(search.toLowerCase()))

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent hideClose className="!p-0 max-w-2xl overflow-hidden">
        <div
          className="flex items-center gap-3 border-b border-border px-4"
          style={{ height: 52 }}
        >
          <Search className="h-4 w-4 flex-shrink-0 text-text-muted" />
          <input
            placeholder="Search or type a command..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="h-full flex-1 border-none bg-transparent text-[15px] text-text-primary outline-none"
          />
          <kbd
            className="flex-shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-text-secondary"
            style={{ backgroundColor: 'var(--color-surface-alt)' }}
          >
            ESC
          </kbd>
        </div>

        <div className="max-h-[380px] overflow-y-auto py-2">
          {(['recent', 'action', 'navigation'] as const).map(category => {
            const items = filtered.filter(c => c.category === category)
            if (!items.length) return null
            return (
              <div key={category} className="mb-1">
                <p className="px-4 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  {CATEGORY_LABEL[category]}
                </p>
                {items.map(cmd => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); setOpen(false) }}
                    onMouseEnter={() => setActive(cmd.id)}
                    onMouseLeave={() => setActive(null)}
                    className="flex w-full cursor-pointer items-center justify-between border-l-2 border-transparent py-2.5 pl-3.5 pr-4 text-left transition-colors"
                    style={{
                      backgroundColor: active === cmd.id ? 'var(--color-primary-light)' : 'transparent',
                      borderLeftColor: active === cmd.id ? 'var(--color-primary)' : 'transparent',
                    }}
                  >
                    <span
                      className="text-sm text-text-secondary"
                      style={{ fontWeight: active === cmd.id ? 500 : 400, color: active === cmd.id ? 'var(--color-text-primary)' : undefined }}
                    >
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className="flex-shrink-0 rounded-md border border-border px-1.5 py-0.5 font-mono text-[11px] text-text-secondary"
                        style={{ backgroundColor: 'var(--color-surface-alt)' }}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-text-secondary">No commands found for &ldquo;{search}&rdquo;</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border px-4 py-2">
          {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <kbd
                className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-secondary"
                style={{ backgroundColor: 'var(--color-surface-alt)' }}
              >
                {key}
              </kbd>
              <span className="text-[11px] text-text-secondary">{label}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
