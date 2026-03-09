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
        <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid #bae6fd', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FolderPlus className="h-5 w-5" style={{ color: '#0ea5e9' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0c4a6e', margin: 0 }}>Create Folder</h2>
            {parentFolderName && (
              <p style={{ fontSize: 12, color: '#6b7280', margin: '3px 0 0' }}>in {parentFolderName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X className="h-4 w-4" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 22px' }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#0c4a6e', display: 'block', marginBottom: 8 }}>
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={e => { setFolderName(e.target.value); setError('') }}
              placeholder="e.g., Marketing Materials"
              autoFocus
              disabled={isSubmitting}
              style={{ width: '100%', height: 44, backgroundColor: '#e0f2fe', border: `1px solid ${error ? '#DC2626' : '#bae6fd'}`, borderRadius: 10, padding: '0 14px', fontSize: 14, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { if (!error) { e.currentTarget.style.borderColor = '#0ea5e9'; e.currentTarget.style.backgroundColor = '#FFFFFF' } }}
              onBlur={e => { if (!error) { e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.backgroundColor = '#e0f2fe' } }}
            />
            {error && (
              <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>{error}</p>
            )}
          </div>

          {/* ── Footer ── */}
          <div style={{ borderTop: '1px solid #bae6fd', padding: '14px 22px', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ height: 40, padding: '0 18px', borderRadius: 10, background: 'linear-gradient(135deg, #0ea5e9, #06b6d4)', color: '#FFFFFF', fontSize: 13, fontWeight: 700, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {isSubmitting ? (
                <>
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#FFFFFF', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
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
