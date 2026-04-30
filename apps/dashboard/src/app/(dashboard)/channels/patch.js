const fs = require('fs')

const file = 'cms-frontennd/apps/dashboard/src/app/(dashboard)/channels/page.tsx'
let content = fs.readFileSync(file, 'utf8')

// 1. Imports
content = content.replace(
  "import { useChannels } from '@/hooks/queries'",
  "import { useChannels, useDeleteChannel, useBulkDeleteChannels } from '@/hooks/queries'\nimport { Trash2, Check } from 'lucide-react'\nimport { ConfirmDialog } from '@/components/ui/confirm-dialog'\nimport { toast } from '@/hooks/use-toast'"
)

// 2. ChannelCard signature
content = content.replace(
  "function ChannelCard({ channel }: { channel: any }) {",
  "function ChannelCard({ channel, isSelected, onSelect, onDelete }: { channel: any; isSelected?: boolean; onSelect?: (selected: boolean) => void; onDelete?: () => void }) {"
)

// 3. ChannelCard border & background for selected state
content = content.replace(
  "style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}",
  "style={{ backgroundColor: '#FFFFFF', border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)' }}"
)

// 4. ChannelCard Checkbox & Delete inside image area
content = content.replace(
  "{/* TV icon — top-left */}",
  `{/* Checkbox — top-left */}
        <div className={\`absolute top-3 left-3 z-20 p-1 rounded-lg transition-all duration-200 \${isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}\`}
             style={{ backgroundColor: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.9)' }}
             onClick={(e) => { e.stopPropagation(); onSelect?.(!isSelected); }}>
          <div className="w-5 h-5 flex items-center justify-center">
            {isSelected ? <Check className="h-3.5 w-3.5 text-white" /> : <div className="w-4 h-4 rounded border border-slate-300" />}
          </div>
        </div>
        {/* TV icon — top-left (hidden when selected or hovered) */}
        <div className={\`absolute top-3 left-3 z-10 transition-opacity \${isSelected ? 'opacity-0' : 'opacity-100'}\`}>`
)

content = content.replace(
  "        {/* TV icon — top-left */}",
  `        {/* Checkbox — top-left */}`
)

content = content.replace(
  "Edit Layout",
  "Edit Layout\n                </button>\n                <button\n                  onClick={(e) => {\n                    e.stopPropagation()\n                    onDelete?.()\n                  }}\n                  className=\"px-3 py-1.5 ml-2 rounded-lg text-xs font-semibold transition-opacity hover:bg-red-600/90\"\n                  style={{ backgroundColor: '#DC2626', color: '#FFFFFF' }}\n                >\n                  Delete"
)

// 5. ChannelsPage state variables
content = content.replace(
  "  const [searchFocused, setSearchFocused] = useState(false)",
  "  const [searchFocused, setSearchFocused] = useState(false)\n  const [selectedChannels, setSelectedChannels] = useState<string[]>([])\n  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false)\n  const [channelToDelete, setChannelToDelete] = useState<any>(null)\n  const deleteMutation = useDeleteChannel()\n  const bulkDeleteMutation = useBulkDeleteChannels()"
)

// 6. ChannelsPage handlers
content = content.replace(
  "  const filteredChannels = channels",
  `  const toggleSelectAll = () => {
    if (selectedChannels.length === filteredChannels.length && filteredChannels.length > 0) {
      setSelectedChannels([])
    } else {
      setSelectedChannels(filteredChannels.map((c: any) => c.id))
    }
  }

  const handleDeleteChannel = () => {
    if (!channelToDelete) return
    deleteMutation.mutate(
      { workspaceId, channelId: channelToDelete.id },
      {
        onSuccess: () => {
          toast.success('Channel deleted successfully')
          setChannelToDelete(null)
          setSelectedChannels(prev => prev.filter(id => id !== channelToDelete.id))
        },
        onError: () => toast.error('Failed to delete channel')
      }
    )
  }

  const handleBulkDelete = () => {
    if (selectedChannels.length === 0) return
    bulkDeleteMutation.mutate(
      { workspaceId, channelIds: selectedChannels.map(String) },
      {
        onSuccess: () => {
          toast.success('Channels deleted successfully')
          setSelectedChannels([])
          setShowBulkDeleteConfirm(false)
        },
        onError: () => toast.error('Failed to delete channels')
      }
    )
  }

  const filteredChannels = channels`
)

// 7. Bulk Action Bar
content = content.replace(
  "      {/* ── Channel grid (scrollable) ─────────────────────────── */}",
  `      {/* ── Bulk Actions Bar ────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedChannels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between px-4 py-2 mb-4 rounded-lg shadow-sm"
            style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold" style={{ color: '#1E3A8A' }}>
                {selectedChannels.length} channel{selectedChannels.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedChannels([])}
                className="text-xs font-medium hover:underline"
                style={{ color: '#3B82F6' }}
              >
                Clear Selection
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"
                style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Channel grid (scrollable) ─────────────────────────── */}`
)

// 8. Passing props to ChannelCard
content = content.replace(
  "<ChannelCard key={channel.id} channel={channel} />",
  `<ChannelCard 
              key={channel.id} 
              channel={channel} 
              isSelected={selectedChannels.includes(channel.id)}
              onSelect={(selected) => {
                if (selected) setSelectedChannels(prev => [...prev, channel.id])
                else setSelectedChannels(prev => prev.filter(id => id !== channel.id))
              }}
              onDelete={() => setChannelToDelete(channel)}
            />`
)

// 9. Passing props to List View
content = content.replace(
  "              <motion.div\n                key={channel.id}",
  `              <motion.div
                key={channel.id}`
)

// Let's modify List view item too
content = content.replace(
  "                onClick={() => router.push(`/channels/${channel.id}/studio`)}",
  `                onClick={() => router.push(\`/channels/\${channel.id}/studio\`)}
              >
                <div 
                  className="flex items-center justify-center p-2 rounded cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    const isSelected = selectedChannels.includes(channel.id)
                    if (!isSelected) setSelectedChannels(prev => [...prev, channel.id])
                    else setSelectedChannels(prev => prev.filter(id => id !== channel.id))
                  }}
                >
                  <div className={\`w-4 h-4 rounded border flex items-center justify-center \${selectedChannels.includes(channel.id) ? 'bg-primary border-primary' : 'bg-white border-slate-300'}\`}
                       style={{ backgroundColor: selectedChannels.includes(channel.id) ? 'var(--color-primary)' : '#FFF' }}>
                    {selectedChannels.includes(channel.id) && <Check className="h-3 w-3 text-white" />}
                  </div>
                </div>`
)

// List view Delete Button
content = content.replace(
  "                  {formatDate(channel.updated_at)}\n                </span>\n              </motion.div>",
  `                  {formatDate(channel.updated_at)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setChannelToDelete(channel)
                  }}
                  className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>`
)

// 10. Dialogs at the end
content = content.replace(
  "    </div>\n  )\n}",
  `      
      <ConfirmDialog
        isOpen={!!channelToDelete}
        onClose={() => setChannelToDelete(null)}
        onConfirm={handleDeleteChannel}
        title="Delete Channel"
        description={\`Are you sure you want to delete "\${channelToDelete?.name}"? This action cannot be undone.\`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Delete Channels"
        description={\`Are you sure you want to delete \${selectedChannels.length} channels? This action cannot be undone.\`}
        confirmText="Delete All"
        cancelText="Cancel"
        variant="danger"
        isLoading={bulkDeleteMutation.isPending}
      />
    </div>
  )
}`
)

fs.writeFileSync(file, content)
