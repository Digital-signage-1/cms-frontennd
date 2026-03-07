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
        {/* ── Search row ── */}
        <div className="border-b border-border" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 52 }}>
          <Search className="h-4 w-4 text-text-muted" style={{ flexShrink: 0 }} />
          <input
            placeholder="Search or type a command..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            className="text-text-primary"
            style={{ flex: 1, height: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: 15 }}
          />
          <kbd className="text-text-muted bg-surface border border-border" style={{ fontSize: 11, borderRadius: 6, padding: '2px 6px', fontFamily: 'monospace', flexShrink: 0 }}>
            ESC
          </kbd>
        </div>

        {/* ── Command list ── */}
        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {(['recent', 'action', 'navigation'] as const).map(category => {
            const items = filtered.filter(c => c.category === category)
            if (!items.length) return null
            return (
              <div key={category} style={{ marginBottom: 4 }}>
                <p className="text-text-muted" style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 16px 4px' }}>
                  {CATEGORY_LABEL[category]}
                </p>
                {items.map(cmd => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); setOpen(false) }}
                    className="hover:bg-primary/5"
                    onMouseEnter={() => setActive(cmd.id)}
                    onMouseLeave={() => setActive(null)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: active === cmd.id ? undefined : 'transparent', borderLeft: active === cmd.id ? '2px solid var(--color-primary)' : '2px solid transparent', paddingLeft: 14, transition: 'all 0.1s' }}
                  >
                    <span className={active === cmd.id ? 'text-text-primary font-medium' : 'text-text-secondary'} style={{ fontSize: 14 }}>
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <kbd className="text-text-muted bg-surface border border-border" style={{ fontSize: 11, borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace', flexShrink: 0 }}>
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '32px 16px', textAlign: 'center' }}>
              <p className="text-text-muted" style={{ fontSize: 13 }}>No commands found for &ldquo;{search}&rdquo;</p>
            </div>
          )}
        </div>

        {/* ── Footer hint ── */}
        <div className="border-t border-border" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd className="text-text-muted bg-surface border border-border" style={{ fontSize: 10, borderRadius: 5, padding: '1px 6px', fontFamily: 'monospace' }}>{key}</kbd>
              <span className="text-text-muted" style={{ fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
