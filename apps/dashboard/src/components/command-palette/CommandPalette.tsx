'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Command {
  id: string
  label: string
  category: 'recent' | 'action' | 'navigation'
  action: () => void
  shortcut?: string
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const commands: Command[] = [
    { id: 'recent-1', label: 'Lobby Display', category: 'recent', action: () => router.push('/players') },
    { id: 'recent-2', label: 'Product Showcase', category: 'recent', action: () => router.push('/apps') },
    
    { 
      id: 'action-1', 
      label: 'Create new channel', 
      category: 'action', 
      action: () => router.push('/channels/new'),
      shortcut: '⌘ + Shift + C'
    },
    { 
      id: 'action-2', 
      label: 'Upload content', 
      category: 'action', 
      action: () => router.push('/content'),
      shortcut: '⌘ + Shift + U'
    },
    { 
      id: 'action-3', 
      label: 'Register player', 
      category: 'action', 
      action: () => router.push('/players'),
      shortcut: '⌘ + Shift + P'
    },
    
    { 
      id: 'nav-1', 
      label: 'Go to Channels', 
      category: 'navigation', 
      action: () => router.push('/channels'),
      shortcut: 'G then C'
    },
    { 
      id: 'nav-2', 
      label: 'Go to Players', 
      category: 'navigation', 
      action: () => router.push('/players'),
      shortcut: 'G then P'
    },
    { 
      id: 'nav-3', 
      label: 'Go to Settings', 
      category: 'navigation', 
      action: () => router.push('/settings'),
      shortcut: 'G then S'
    },
  ]

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <Input
          placeholder="Search or type a command..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 border-b border-border rounded-none focus-visible:ring-0 h-12 text-base"
          autoFocus
        />
        <div className="max-h-96 overflow-y-auto p-2">
          {['recent', 'action', 'navigation'].map(category => {
            const items = filteredCommands.filter(c => c.category === category)
            if (items.length === 0) return null
            
            return (
              <div key={category} className="mb-4 last:mb-0">
                <p className="text-xs uppercase text-text-muted px-3 py-2 font-medium tracking-wider">
                  {category}
                </p>
                <div className="space-y-0.5">
                  {items.map(cmd => (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        cmd.action()
                        setOpen(false)
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-alt text-left transition-colors"
                    >
                      <span className="text-sm text-text-primary">{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="text-xs text-text-muted font-mono">{cmd.shortcut}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {filteredCommands.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-text-muted">No commands found</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
