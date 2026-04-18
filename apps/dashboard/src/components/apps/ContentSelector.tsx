'use client'

import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Search, FileImage, FileVideo, FileText, File, X, Folder, ChevronRight, Home, Library, Music } from 'lucide-react'
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
  File:  { bg: 'rgba(107,114,128,0.22)', color: 'var(--color-text-muted)' },
}

type ContentGroup = 'image' | 'video' | 'document' | 'pdf' | 'audio' | 'all'

function contentGroupFromMime(mime: string | null | undefined): ContentGroup {
  if (!mime) return 'all'
  const m = mime.toLowerCase()
  if (m.startsWith('image/')) return 'image'
  if (m.startsWith('video/')) return 'video'
  if (m.includes('pdf')) return 'pdf'
  if (m.startsWith('audio/')) return 'audio'
  if (
    m.includes('presentation') ||
    m.includes('powerpoint') ||
    m.includes('officedocument') ||
    m.includes('msword') ||
    m.includes('wordprocessingml')
  ) return 'document'
  return 'all'
}

export function ContentSelector({ isOpen, onClose, onSelect, acceptedTypes, contentType, currentContentId }: ContentSelectorProps) {
  const [searchQuery, setSearchQuery]   = useState('')
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [contentGroup, setContentGroup] = useState<ContentGroup | null>(null)
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

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setCurrentFolder(null)
      setContentGroup(null)
    }
  }, [isOpen])

  const filteredContent = useMemo(() => {
    return assets.filter((item: Content) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (acceptedTypes?.length && item.mime_type) {
        const matchesType = acceptedTypes.some(t => item.mime_type!.startsWith(t.replace('/*', '')))
        if (!matchesSearch || !matchesType) return false
      } else if (!matchesSearch) {
        return false
      }
      if (contentType) return true
      if (!contentGroup || contentGroup === 'all') return true
      const g = contentGroupFromMime(item.mime_type)
      return g === contentGroup
    })
  }, [assets, searchQuery, acceptedTypes, contentGroup, contentType])

  const groupCounts = useMemo(() => {
    const base = assets.filter((item: Content) => {
      if (!acceptedTypes?.length) return true
      if (!item.mime_type) return false
      return acceptedTypes.some(t => item.mime_type!.startsWith(t.replace('/*', '')))
    })
    const counts: Record<ContentGroup, number> = { image: 0, video: 0, document: 0, pdf: 0, audio: 0, all: base.length }
    for (const item of base) {
      const g = contentGroupFromMime(item.mime_type)
      if (g !== 'all') counts[g] += 1
    }
    return counts
  }, [assets, acceptedTypes])

  const showGroups = !contentType && !searchQuery.trim() && !contentGroup
  const showContentList = !showGroups

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
        <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'var(--color-primary-light)', border: '1px solid color-mix(in srgb, var(--color-primary) 16%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Library className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>Select Content</p>
            <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}>
              {acceptedTypes?.length ? `Choose from ${acceptedTypes.join(', ')} files` : 'Choose content from your library'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X className="h-4 w-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* ── Search + breadcrumb ── */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Search className="h-4 w-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              placeholder="Search content..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', height: 38, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', borderRadius: 8, paddingLeft: 36, paddingRight: 12, fontSize: 13, color: 'var(--color-text-primary)', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            />
          </div>

          {!contentType && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {([
                { id: 'all' as const, label: 'All', Icon: File, bg: 'rgba(107,114,128,0.16)', color: 'var(--color-text-muted)' },
                { id: 'image' as const, label: 'Images', Icon: FileImage, bg: 'rgba(59,130,246,0.16)', color: '#60A5FA' },
                { id: 'video' as const, label: 'Videos', Icon: FileVideo, bg: 'rgba(5,150,105,0.16)', color: '#059669' },
                { id: 'document' as const, label: 'PPT & Docs', Icon: FileText, bg: 'rgba(99,102,241,0.16)', color: '#818CF8' },
                { id: 'pdf' as const, label: 'PDFs', Icon: FileText, bg: 'rgba(245,158,11,0.16)', color: '#F59E0B' },
                { id: 'audio' as const, label: 'Audio', Icon: Music, bg: 'rgba(236,72,153,0.16)', color: '#EC4899' },
              ]).map(({ id, label, Icon, bg, color }) => {
                const chosen = contentGroup === id || (!contentGroup && id === 'all' && !searchQuery.trim())
                const count = groupCounts[id]
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setContentGroup((prev) => (prev === id ? null : id))}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      height: 34,
                      padding: '0 10px',
                      borderRadius: 999,
                      border: chosen ? '1px solid color-mix(in srgb, var(--color-primary) 40%, var(--color-border))' : '1px solid var(--color-border)',
                      backgroundColor: chosen ? 'var(--color-primary-light)' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ width: 22, height: 22, borderRadius: 8, backgroundColor: chosen ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon className="h-3.5 w-3.5" style={{ color: chosen ? 'var(--color-primary)' : color }} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: chosen ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>{label}</span>
                    <span style={{ fontSize: 11, color: chosen ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>{count}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Breadcrumb */}
          {breadcrumbPath.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
              <button onClick={() => setCurrentFolder(null)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Home className="h-3 w-3" />Home
              </button>
              {breadcrumbPath.map((folder, i) => (
                <div key={folder.folder_id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ChevronRight className="h-3 w-3" style={{ color: 'var(--color-text-muted)' }} />
                  <button
                    onClick={() => setCurrentFolder(folder.folder_id)}
                    style={{ fontSize: 12, color: i === breadcrumbPath.length - 1 ? 'var(--color-text-primary)' : 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: i === breadcrumbPath.length - 1 ? 600 : 400 }}
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
                <div key={i} style={{ aspectRatio: '1', backgroundColor: 'var(--color-surface-alt)', borderRadius: 10, opacity: 0.5 }} />
              ))}
            </div>
          ) : showGroups ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 10 }}>
              <Library className="h-10 w-10" style={{ color: 'var(--color-border)' }} />
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: 0 }}>Choose a content type to browse</p>
            </div>
          ) : filteredFolders.length === 0 && filteredContent.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 8 }}>
              <File className="h-10 w-10" style={{ color: 'var(--color-border)' }} />
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{searchQuery ? 'No content found' : 'No content available'}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Folders */}
              {filteredFolders.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 10px' }}>Folders</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                    {filteredFolders.map((folder: FolderType) => (
                      <motion.button
                        key={folder.folder_id}
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setCurrentFolder(folder.folder_id)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', borderRadius: 10, cursor: 'pointer', border: '1px solid var(--color-border)', backgroundColor: '#FFFFFF', gap: 6 }}
                        whileHover={{ backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' } as any}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Folder className="h-5 w-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                          {folder.name}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{folder.content_count || 0} items</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              {showContentList && filteredContent.length > 0 && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', margin: '0 0 10px' }}>Content</p>
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
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 6px', borderRadius: 10, cursor: 'pointer', border: isSelected ? '1px solid color-mix(in srgb, var(--color-primary) 50%, transparent)' : '1px solid var(--color-border)', backgroundColor: isSelected ? 'var(--color-primary-light)' : '#FFFFFF', gap: 6, transition: 'all 0.15s' }}
                          whileHover={!isSelected ? { backgroundColor: 'var(--color-surface-alt)', borderColor: 'var(--color-border)' } as any : undefined}
                        >
                          <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : typeStyle.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                            <Icon className="h-5 w-5" style={{ color: isSelected ? 'var(--color-primary)' : typeStyle.color }} />
                            {(content.thumbnail_url || content.url) && (typeLabel === 'Image' || ((typeLabel === 'Video' || typeLabel === 'PDF' || typeLabel === 'File') && content.thumbnail_url)) && (
                              <img
                                src={content.thumbnail_url || content.url}
                                alt={content.name}
                                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                              />
                            )}
                          </div>
                          <span style={{ fontSize: 11, color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>
                            {content.name}
                          </span>
                          <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{typeLabel}</span>
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
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            {filteredFolders.length > 0 && `${filteredFolders.length} folder${filteredFolders.length !== 1 ? 's' : ''}`}
            {filteredFolders.length > 0 && filteredContent.length > 0 && ' · '}
            {filteredContent.length > 0 && `${filteredContent.length} item${filteredContent.length !== 1 ? 's' : ''}`}
          </span>
          <button
            onClick={onClose}
            style={{ height: 38, padding: '0 18px', borderRadius: 8, backgroundColor: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
