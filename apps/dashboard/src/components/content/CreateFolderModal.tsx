'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { FolderPlus, X } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  parentFolderName?: string
}

export function CreateFolderModal({ isOpen, onClose, onSubmit, parentFolderName }: CreateFolderModalProps) {
  const [folderName, setFolderName]   = useState('')
  const [error, setError]             = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) { setFolderName(''); setError('') }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!folderName.trim()) { setError('Folder name is required'); return }
    setIsSubmitting(true); setError('')
    try {
      await onSubmit(folderName.trim())
      setFolderName(''); onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => { if (!isSubmitting) onClose() }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent hideClose className="!p-0 max-w-md">
        {/* ── Header ── */}
        <div className="border-b border-border" style={{ padding: '20px 22px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div className="bg-primary/15 border border-primary/25" style={{ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FolderPlus className="h-5 w-5 text-primary" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="text-text-primary" style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Create Folder</h2>
            {parentFolderName && (
              <p className="text-text-muted" style={{ fontSize: 12, margin: '3px 0 0' }}>in {parentFolderName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="bg-surface-hover border border-border hover:bg-surface-elevated"
            style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 22px' }}>
            <label className="text-[13px] font-semibold text-text-primary block mb-2">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={e => { setFolderName(e.target.value); setError('') }}
              placeholder="e.g., Marketing Materials"
              autoFocus
              disabled={isSubmitting}
              className={`w-full bg-surface border text-text-primary focus:border-primary ${error ? 'border-red-600' : 'border-border'}`}
              style={{ height: 44, borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            />
            {error && (
              <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>{error}</p>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-border" style={{ padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="bg-surface-elevated border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              style={{ height: 40, padding: '0 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-on-primary"
              style={{ height: 40, padding: '0 18px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Creating...
                </>
              ) : 'Create Folder'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
