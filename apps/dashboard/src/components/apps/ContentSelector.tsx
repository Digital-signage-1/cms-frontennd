'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Search, FileImage, FileVideo, FileText, File, X, Folder, ChevronRight, Home, Library } from 'lucide-react'
import { useContent, useFolders, useAllFolders } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import type { Content, Folder as FolderType, ContentType } from '@signage/types'
import { motion } from 'framer-motion'

interface ContentSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (content: Content) => void
  acceptedTypes?: string[]
  contentType?: ContentType
  currentContentId?: string
}

const getContentIcon = (mime: string) => {
  if (mime.startsWith('image/')) return FileImage
  if (mime.startsWith('video/')) return FileVideo
  if (mime.includes('pdf'))      return FileText
  return File
}

const getTypeLabel = (mime: string) => {
  if (mime.startsWith('image/')) return 'Image'
  if (mime.startsWith('video/')) return 'Video'
  if (mime.includes('pdf'))      return 'PDF'
  return 'File'
}

// icon bg per type — data-driven, keep as-is
const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  Image: { bg: 'rgba(59,130,246,0.22)',  color: '#60A5FA' },
  Video: { bg: 'rgba(5,150,105,0.22)',   color: '#34D399' },
  PDF:   { bg: 'rgba(245,158,11,0.22)',  color: '#F59E0B' },
  File:  { bg: 'rgba(107,114,128,0.22)', color: '#9CA3AF' },
}

export function ContentSelector({ isOpen, onClose, onSelect, acceptedTypes, contentType, currentContentId }: ContentSelectorProps) {
  const [searchQuery, setSearchQuery]   = useState('')
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const workspace   = useAuthStore(s => s.workspace)
  const workspaceId = Number(workspace?.id || workspace?.workspace_id || 0)

  const { data: contentData, isLoading }          = useContent(workspaceId, { search: searchQuery || undefined, folder_id: currentFolder || undefined, type: contentType })
  const { data: foldersResponse, isLoading: foldersLoading } = useFolders(workspaceId, currentFolder)
  const { data: allFoldersResponse }              = useAllFolders(workspaceId)

  const assets        = Array.isArray(contentData) ? contentData : contentData?.items || []
  const currentFolders = Array.isArray(foldersResponse) ? foldersResponse : []
  const allFolders    = Array.isArray(allFoldersResponse) ? allFoldersResponse : []

  const filteredFolders = useMemo(() =>
    currentFolders.filter((f: FolderType) => f.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [currentFolders, searchQuery]
  )

  const filteredContent = useMemo(() => {
    return assets.filter((item: Content) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (acceptedTypes?.length && item.mime_type) {
        const matchesType = acceptedTypes.some(t => item.mime_type!.startsWith(t.replace('/*', '')))
        return matchesSearch && matchesType
      }
      return matchesSearch
    })
  }, [assets, searchQuery, acceptedTypes])

  // Breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!currentFolder) return []
    const path: FolderType[] = []
    let folderId: string | undefined = currentFolder
    while (folderId) {
      const id: string = folderId
      const folder = allFolders.find((f: FolderType) => f.folder_id === id)
      if (!folder) break
      path.unshift(folder)
      folderId = folder.parent_id
    }
    return path
  }, [currentFolder, allFolders])

  const handleSelect = (content: Content) => { onSelect(content); onClose() }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="!p-0 max-w-4xl flex flex-col overflow-hidden" style={{ maxHeight: '82vh' }}>

        {/* ── Header ── */}
        <div className="border-b border-border" style={{ padding: '16px 20px 14px', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div className="bg-primary/15 border border-primary/25" style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Library className="h-5 w-5 text-primary" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="text-text-primary" style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Select Content</p>
            <p className="text-text-muted" style={{ fontSize: 12, margin: '2px 0 0' }}>
              {acceptedTypes?.length ? `Choose from ${acceptedTypes.join(', ')} files` : 'Choose content from your library'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-surface-hover border border-border hover:bg-surface-elevated"
            style={{ width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        {/* ── Search + breadcrumb ── */}
        <div className="border-b border-border" style={{ padding: '12px 20px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search className="h-4 w-4 text-text-muted" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Search content..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border text-text-primary focus:border-primary"
              style={{ height: 38, borderRadius: 8, paddingLeft: 36, paddingRight: 12, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Breadcrumb */}
          {breadcrumbPath.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <button onClick={() => setCurrentFolder(null)} className="text-text-secondary hover:text-text-primary" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Home className="h-3 w-3" />Home
              </button>
              {breadcrumbPath.map((folder, i) => (
                <div key={folder.folder_id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ChevronRight className="h-3 w-3 text-text-muted" />
                  <button
                    onClick={() => setCurrentFolder(folder.folder_id)}
                    className={i === breadcrumbPath.length - 1 ? 'text-text-primary font-semibold' : 'text-text-secondary hover:text-text-primary'}
                    style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Content grid ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {isLoading || foldersLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="bg-surface" style={{ aspectRatio: '1', borderRadius: 10, opacity: 0.5 }} />
              ))}
            </div>
          ) : filteredFolders.length === 0 && filteredContent.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 8 }}>
              <File className="h-10 w-10 text-border" />
              <p className="text-text-muted" style={{ fontSize: 13 }}>{searchQuery ? 'No content found' : 'No content available'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div>
                  <p className="text-text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Folders</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {filteredFolders.map((folder: FolderType) => (
                      <motion.button
                        key={folder.folder_id}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setCurrentFolder(folder.folder_id)}
                        className="border border-border bg-surface hover:bg-surface-elevated hover:border-border"
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', borderRadius: 10, cursor: 'pointer', gap: 6 }}
                      >
                        <div className="bg-primary/15" style={{ width: 44, height: 44, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Folder className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-text-secondary" style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                          {folder.name}
                        </span>
                        <span className="text-text-muted" style={{ fontSize: 10 }}>{folder.content_count || 0} items</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              {filteredContent.length > 0 && (
                <div>
                  <p className="text-text-muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>Content</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {filteredContent.map((content: Content) => {
                      const Icon      = getContentIcon(content.mime_type)
                      const typeLabel = getTypeLabel(content.mime_type)
                      const typeStyle = TYPE_STYLE[typeLabel] || TYPE_STYLE.File
                      const isSelected = content.content_id === currentContentId
                      return (
                        <motion.button
                          key={content.content_id}
                          initial={{ opacity: 0, scale: 0.94 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => handleSelect(content)}
                          className={isSelected ? 'border border-primary/50 bg-primary/5' : 'border border-border bg-surface hover:bg-surface-elevated'}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', borderRadius: 10, cursor: 'pointer', gap: 6, transition: 'all 0.15s' }}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: isSelected ? 'rgba(245,166,36,0.20)' : typeStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                            <Icon className="h-5 w-5" style={{ color: isSelected ? '#F5A624' : typeStyle.color }} />
                            {(content.thumbnail_url || content.url) && (typeLabel === 'Image' || ((typeLabel === 'Video' || typeLabel === 'PDF' || typeLabel === 'File') && content.thumbnail_url)) && (
                              <img
                                src={content.thumbnail_url || content.url}
                                alt={content.name}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                              />
                            )}
                          </div>
                          <span className={isSelected ? 'text-primary' : 'text-text-secondary'} style={{ fontSize: 11, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                            {content.name}
                          </span>
                          <span className="text-text-muted" style={{ fontSize: 10 }}>{typeLabel}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="border-t border-border" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span className="text-text-muted" style={{ fontSize: 12 }}>
            {filteredFolders.length > 0 && `${filteredFolders.length} folder${filteredFolders.length !== 1 ? 's' : ''}`}
            {filteredFolders.length > 0 && filteredContent.length > 0 && ' · '}
            {filteredContent.length > 0 && `${filteredContent.length} item${filteredContent.length !== 1 ? 's' : ''}`}
          </span>
          <button
            onClick={onClose}
            className="bg-surface-elevated border border-border text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            style={{ height: 38, padding: '0 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
