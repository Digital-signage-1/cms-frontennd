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

// icon bg per type
const TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  Image: { bg: 'rgba(59,130,246,0.22)',  color: '#60A5FA' },
  Video: { bg: 'rgba(5,150,105,0.22)',   color: '#059669' },
  PDF:   { bg: 'rgba(245,158,11,0.22)',  color: '#F59E0B' },
  File:  { bg: 'rgba(107,114,128,0.22)', color: '#6b7280' },
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
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Library className="h-5 w-5" style={{ color: '#0ea5e9' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#0c4a6e', margin: 0 }}>Select Content</p>
            <p style={{ fontSize: 12, color: '#0369a1', margin: '2px 0 0' }}>
              {acceptedTypes?.length ? `Choose from ${acceptedTypes.join(', ')} files` : 'Choose content from your library'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X className="h-4 w-4" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* ── Search + breadcrumb ── */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #bae6fd', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search className="h-4 w-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
            <input
              placeholder="Search content..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: 38, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, paddingLeft: 36, paddingRight: 12, fontSize: 13, color: '#0c4a6e', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.currentTarget.style.borderColor = '#0ea5e9' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#bae6fd' }}
            />
          </div>

          {/* Breadcrumb */}
          {breadcrumbPath.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <button onClick={() => setCurrentFolder(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Home className="h-3 w-3" />Home
              </button>
              {breadcrumbPath.map((folder, i) => (
                <div key={folder.folder_id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ChevronRight className="h-3 w-3" style={{ color: '#6b7280' }} />
                  <button
                    onClick={() => setCurrentFolder(folder.folder_id)}
                    style={{ fontSize: 12, color: i === breadcrumbPath.length - 1 ? '#0c4a6e' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: i === breadcrumbPath.length - 1 ? 600 : 400 }}
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
                <div key={i} style={{ aspectRatio: '1', backgroundColor: '#e0f2fe', borderRadius: 10, opacity: 0.5 }} />
              ))}
            </div>
          ) : filteredFolders.length === 0 && filteredContent.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 8 }}>
              <File className="h-10 w-10" style={{ color: '#bae6fd' }} />
              <p style={{ fontSize: 13, color: '#6b7280' }}>{searchQuery ? 'No content found' : 'No content available'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', margin: '0 0 10px' }}>Folders</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {filteredFolders.map((folder: FolderType) => (
                      <motion.button
                        key={folder.folder_id}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setCurrentFolder(folder.folder_id)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', borderRadius: 10, cursor: 'pointer', border: '1px solid #bae6fd', backgroundColor: '#FFFFFF', gap: 6 }}
                        whileHover={{ backgroundColor: '#e0f2fe', borderColor: '#bae6fd' } as any}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: 'rgba(14,165,233,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Folder className="h-5 w-5" style={{ color: '#0ea5e9' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#0369a1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                          {folder.name}
                        </span>
                        <span style={{ fontSize: 10, color: '#6b7280' }}>{folder.content_count || 0} items</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              {filteredContent.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', margin: '0 0 10px' }}>Content</p>
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
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', borderRadius: 10, cursor: 'pointer', border: isSelected ? '1px solid rgba(14,165,233,0.50)' : '1px solid #bae6fd', backgroundColor: isSelected ? 'rgba(14,165,233,0.08)' : '#FFFFFF', gap: 6, transition: 'all 0.15s' }}
                          whileHover={!isSelected ? { backgroundColor: '#e0f2fe', borderColor: '#bae6fd' } as any : undefined}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: isSelected ? 'rgba(14,165,233,0.12)' : typeStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                            <Icon className="h-5 w-5" style={{ color: isSelected ? '#0ea5e9' : typeStyle.color }} />
                            {(content.thumbnail_url || content.url) && (typeLabel === 'Image' || ((typeLabel === 'Video' || typeLabel === 'PDF' || typeLabel === 'File') && content.thumbnail_url)) && (
                              <img
                                src={content.thumbnail_url || content.url}
                                alt={content.name}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                              />
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: isSelected ? '#0ea5e9' : '#0369a1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                            {content.name}
                          </span>
                          <span style={{ fontSize: 10, color: '#6b7280' }}>{typeLabel}</span>
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
        <div style={{ borderTop: '1px solid #bae6fd', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>
            {filteredFolders.length > 0 && `${filteredFolders.length} folder${filteredFolders.length !== 1 ? 's' : ''}`}
            {filteredFolders.length > 0 && filteredContent.length > 0 && ' · '}
            {filteredContent.length > 0 && `${filteredContent.length} item${filteredContent.length !== 1 ? 's' : ''}`}
          </span>
          <button
            onClick={onClose}
            style={{ height: 38, padding: '0 18px', borderRadius: 8, backgroundColor: '#e0f2fe', border: '1px solid #bae6fd', color: '#0369a1', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
