'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button, Input, Label } from '@/components/ui'
import { FolderPlus, Loader2 } from 'lucide-react'
import { getErrorMessage } from '@/lib/errors'

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  parentFolderName?: string
}

export function CreateFolderModal({ isOpen, onClose, onSubmit, parentFolderName }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setFolderName('')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!folderName.trim()) {
      setError('Folder name is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit(folderName.trim())
      setFolderName('')
      onClose()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Create Folder</DialogTitle>
              {parentFolderName && (
                <DialogDescription>in {parentFolderName}</DialogDescription>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="folder-name" className="text-sm font-medium text-text-primary mb-2 block">
              Folder Name
            </Label>
            <Input
              id="folder-name"
              type="text"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value)
                setError('')
              }}
              placeholder="e.g., Marketing Materials"
              className={error ? 'border-error' : ''}
              autoFocus
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-sm text-error mt-1">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              className="bg-primary text-white hover:bg-primary-hover"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Folder'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
