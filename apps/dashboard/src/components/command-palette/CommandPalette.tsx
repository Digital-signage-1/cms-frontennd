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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 52, borderBottom: '1px solid #BAE6FD' }}>
          <Search className="h-4 w-4" style={{ color: '#94A3B8', flexShrink: 0 }} />
          <input
            placeholder="Search or type a command..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            style={{ flex: 1, height: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', fontSize: 15, color: '#0C1A2E' }}
          />
          <kbd style={{ fontSize: 11, color: '#334155', backgroundColor: '#E8F4FB', border: '1px solid #BAE6FD', borderRadius: 6, padding: '2px 6px', fontFamily: 'monospace', flexShrink: 0 }}>
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
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94A3B8', padding: '6px 16px 4px' }}>
                  {CATEGORY_LABEL[category]}
                </p>
                {items.map(cmd => (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); setOpen(false) }}
                    onMouseEnter={() => setActive(cmd.id)}
                    onMouseLeave={() => setActive(null)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', cursor: 'pointer', border: 'none', textAlign: 'left', backgroundColor: active === cmd.id ? 'rgba(8,145,178,0.06)' : 'transparent', borderLeft: active === cmd.id ? '2px solid #0891B2' : '2px solid transparent', paddingLeft: 14, transition: 'all 0.1s' }}
                  >
                    <span style={{ fontSize: 14, color: active === cmd.id ? '#0C1A2E' : '#334155', fontWeight: active === cmd.id ? 500 : 400 }}>
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <kbd style={{ fontSize: 11, color: '#334155', backgroundColor: '#E8F4FB', border: '1px solid #BAE6FD', borderRadius: 6, padding: '2px 7px', fontFamily: 'monospace', flexShrink: 0 }}>
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
              <p style={{ fontSize: 13, color: '#334155' }}>No commands found for &ldquo;{search}&rdquo;</p>
            </div>
          )}
        </div>

        {/* ── Footer hint ── */}
        <div style={{ borderTop: '1px solid #BAE6FD', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          {[['↑↓', 'navigate'], ['↵', 'select'], ['esc', 'close']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd style={{ fontSize: 10, color: '#334155', backgroundColor: '#E8F4FB', border: '1px solid #BAE6FD', borderRadius: 5, padding: '1px 6px', fontFamily: 'monospace' }}>{key}</kbd>
              <span style={{ fontSize: 11, color: '#334155' }}>{label}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
