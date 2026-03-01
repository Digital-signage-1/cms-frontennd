'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UploadCloud, ChevronRight, AlertCircle, FolderOpen,
  Loader2, CheckCircle2, XCircle, FileText, HardDrive,
  Image as ImageIcon, Film, Plus,
} from 'lucide-react'
import {
  useContent, useFolders, useAllFolders, useUploadContent,
  useDeleteContent, useCreateFolder, useDeleteFolder, useConfirmUpload,
} from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import { useBreadcrumb } from '@/contexts/breadcrumb-context'
import { formatBytes } from '@/lib/utils'
import { CreateFolderModal } from '@/components/content/CreateFolderModal'
import { uploadFileToS3 } from '@/lib/upload'
import type { Folder as FolderType } from '@signage/types'

// ── Design tokens ──────────────────────────────────────────────────────────
const FOLDER_ACCENT_COLORS = ['#F5A624', '#7C3AED', '#059669', '#DC2626', '#3B82F6']

function getMimeLabel(asset: any): string {
  const mime: string = asset.mime_type || ''
  const name: string = (asset.name || '').toLowerCase()
  if (mime.includes('pdf'))   return 'PDF'
  if (mime.includes('mp4') || (mime.includes('video') && name.endsWith('.mp4'))) return 'MP4'
  if (mime.includes('video')) return 'MP4'
  if (mime.includes('png')  || name.endsWith('.png'))  return 'PNG'
  if (mime.includes('jpeg') || mime.includes('jpg'))   return 'JPG'
  if (mime.includes('gif')  || name.endsWith('.gif'))  return 'GIF'
  if (mime.includes('webp') || name.endsWith('.webp')) return 'WEBP'
  if (mime.includes('photoshop') || name.endsWith('.psd')) return 'PSD'
  if (mime.includes('zip')  || name.endsWith('.zip'))  return 'ZIP'
  if (mime.includes('audio'))  return 'MP3'
  const ext = asset.name?.split('.').pop()?.toUpperCase()
  return ext || 'FILE'
}

const BADGE: Record<string, { bg: string; color: string }> = {
  PNG:  { bg: 'rgba(100,116,139,0.25)', color: '#94A3B8' },
  JPG:  { bg: 'rgba(100,116,139,0.25)', color: '#94A3B8' },
  GIF:  { bg: 'rgba(100,116,139,0.25)', color: '#94A3B8' },
  WEBP: { bg: 'rgba(100,116,139,0.25)', color: '#94A3B8' },
  PDF:  { bg: 'rgba(245,158,11,0.22)',  color: '#F59E0B' },
  MP4:  { bg: 'rgba(20,184,166,0.22)',  color: '#14B8A6' },
  PSD:  { bg: 'rgba(239,68,68,0.22)',   color: '#F87171' },
  ZIP:  { bg: 'rgba(100,116,139,0.25)', color: '#94A3B8' },
  MP3:  { bg: 'rgba(124,58,237,0.22)',  color: '#A78BFA' },
  FILE: { bg: 'rgba(100,116,139,0.25)', color: '#94A3B8' },
}

const PREVIEW_BG: Record<string, string> = {
  PNG:  'linear-gradient(145deg,#111827 0%,#1F2937 100%)',
  JPG:  'linear-gradient(145deg,#111827 0%,#1F2937 100%)',
  GIF:  'linear-gradient(145deg,#111827 0%,#1F2937 100%)',
  WEBP: 'linear-gradient(145deg,#111827 0%,#1F2937 100%)',
  PDF:  'linear-gradient(145deg,#1C1300 0%,#2D1F00 100%)',
  MP4:  'linear-gradient(145deg,#001A18 0%,#0D2622 100%)',
  PSD:  'linear-gradient(145deg,#1A0009 0%,#2A0012 100%)',
  ZIP:  'linear-gradient(145deg,#111827 0%,#1F2937 100%)',
  FILE: 'linear-gradient(145deg,#111827 0%,#1F2937 100%)',
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const ms = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(ms / 60000)
  const h = Math.floor(ms / 3600000)
  const d = Math.floor(ms / 86400000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

// ── Component ──────────────────────────────────────────────────────────────
export default function ContentPage() {
  const [searchQuery, setSearchQuery]           = useState('')
  const [selectedAssets, setSelectedAssets]     = useState<string[]>([])
  const [currentFolder, setCurrentFolder]       = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [parentFolderForNew, setParentFolderForNew] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus]         = useState<Record<string, 'uploading' | 'success' | 'error'>>({})
  const [uploadProgress, setUploadProgress]     = useState<Record<string, number>>({})
  const [typeFilter, setTypeFilter]             = useState<'all' | 'image' | 'video'>('all')

  const workspace          = useAuthStore((s) => s.workspace)
  const user               = useAuthStore((s) => s.user)
  const isLoadingWorkspace = useAuthStore((s) => s.isLoading)
  const workspaceId        = workspace?.workspace_id || ''

  const { setBreadcrumbItems } = useBreadcrumb()

  // Set header breadcrumb
  useEffect(() => {
    setBreadcrumbItems([{ label: 'Content Library' }])
  }, [setBreadcrumbItems])

  const { data: contentData, isLoading, error } = useContent(workspaceId, {
    search: searchQuery || undefined,
    folder_id: currentFolder || undefined,
  })
  const { data: foldersResponse, isLoading: foldersLoading } = useFolders(workspaceId, currentFolder)
  const { data: allFoldersResponse }                          = useAllFolders(workspaceId)

  const uploadMutation        = useUploadContent()
  const confirmUploadMutation = useConfirmUpload()
  const deleteMutation        = useDeleteContent()
  const createFolderMutation  = useCreateFolder()
  const deleteFolderMutation  = useDeleteFolder()

  const assets         = Array.isArray(contentData) ? contentData : (contentData as any)?.items || []
  const currentFolders = (Array.isArray(foldersResponse) ? foldersResponse : []) as FolderType[]
  const allFolders     = Array.isArray(allFoldersResponse) ? allFoldersResponse : []

  const filteredFolders = currentFolders.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredAssets = (assets as any[]).filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (typeFilter === 'all' || a.content_type === typeFilter)
  )

  // Derived stats
  const totalFiles  = assets.length
  const storageUsed = (assets as any[]).reduce((acc, a) => acc + (a.size_bytes || 0), 0)
  const imageCount  = (assets as any[]).filter((a) => a.content_type === 'image').length
  const videoCount  = (assets as any[]).filter((a) => a.content_type === 'video').length

  const parentFolderName = (allFolders as any[]).find((f) => f.folder_id === parentFolderForNew)?.name

  // ── Handlers (unchanged logic) ──────────────────────────────────────────

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const uploadFileWithRetry = async (file: File, fileId: string, maxRetries = 3): Promise<void> => {
    let uploadResponse: { content_id: string; upload_url: string; s3_key: string; expires_in: number } | null = null
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000))
        if (!uploadResponse) {
          uploadResponse = await uploadMutation.mutateAsync({
            workspaceId,
            data: { name: file.name, mime_type: file.type, size_bytes: file.size, folder_id: currentFolder || undefined },
          })
        }
        await uploadFileToS3(file, uploadResponse!.upload_url, {
          onProgress: (p) => setUploadProgress((prev) => ({ ...prev, [fileId]: p.percentage })),
        })
        await confirmUploadMutation.mutateAsync({ workspaceId, contentId: uploadResponse!.content_id })
        return
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Unknown error')
        const msg = lastError.message.toLowerCase()
        if (msg.includes('status 4') || msg.includes('expired') || msg.includes('invalid')) uploadResponse = null
        if (attempt < maxRetries) continue
        throw lastError
      }
    }
    throw lastError || new Error('Upload failed after retries')
  }

  const handleUpload = async (files: FileList | File[]) => {
    if (!workspaceId) return alert('Please select a workspace before uploading.')
    for (const file of Array.from(files)) {
      const fileId = `${file.name}-${file.size}-${Date.now()}`
      try {
        setUploadStatus((p) => ({ ...p, [fileId]: 'uploading' }))
        setUploadProgress((p) => ({ ...p, [fileId]: 0 }))
        await uploadFileWithRetry(file, fileId)
        setUploadStatus((p) => ({ ...p, [fileId]: 'success' }))
        setUploadProgress((p) => ({ ...p, [fileId]: 100 }))
        setTimeout(() => {
          setUploadStatus((p) => { const n = { ...p }; delete n[fileId]; return n })
          setUploadProgress((p) => { const n = { ...p }; delete n[fileId]; return n })
        }, 2000)
      } catch (err) {
        setUploadStatus((p) => ({ ...p, [fileId]: 'error' }))
        alert(`Upload failed: ${err instanceof Error ? err.message : 'Try again'}`)
        setTimeout(() => {
          setUploadStatus((p) => { const n = { ...p }; delete n[fileId]; return n })
          setUploadProgress((p) => { const n = { ...p }; delete n[fileId]; return n })
        }, 3000)
      }
    }
  }

  const handleDelete = async (ids: string[]) => {
    if (!workspaceId) return alert('Please select a workspace before deleting.')
    const folderIds = ids.filter((id) => (allFolders as any[]).some((f) => f.folder_id === id))
    const contentIds = ids.filter((id) => !(allFolders as any[]).some((f) => f.folder_id === id))
    for (const folderId of folderIds) {
      try {
        await deleteFolderMutation.mutateAsync({ workspaceId, folderId })
        if (currentFolder === folderId) setCurrentFolder(null)
      } catch (err) { alert(`Delete folder failed: ${err instanceof Error ? err.message : 'Try again'}`) }
    }
    for (const contentId of contentIds) {
      try {
        await deleteMutation.mutateAsync({ workspaceId, contentId })
      } catch (err) { alert(`Delete content failed: ${err instanceof Error ? err.message : 'Try again'}`) }
    }
    setSelectedAssets([])
  }

  const handleFolderSubmit = async (name: string) => {
    if (!workspaceId) throw new Error('No workspace selected')
    await createFolderMutation.mutateAsync({
      workspaceId,
      data: { name, parent_id: parentFolderForNew || undefined },
    })
  }

  // ── Guards ───────────────────────────────────────────────────────────────

  if (isLoadingWorkspace || (user && !workspace)) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: '#2A2A2A', borderTopColor: '#F5A624' }} />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>No workspace available</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>Please create a workspace to get started</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0D0D0D' }}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#FFFFFF' }}>Failed to load content</h2>
          <p className="text-sm" style={{ color: '#6B7280' }}>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-5 space-y-5" style={{ backgroundColor: '#0D0D0D', minHeight: '100%' }}>

      {/* ── Hero banner ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, #1B1B35 0%, #162040 50%, #0F2044 100%)',
          border: '1px solid #2A3050',
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),' +
              'linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Title row */}
        <div className="relative flex items-start justify-between px-7 pt-6 pb-4">
          <div>
            <p
              className="text-xs uppercase font-semibold mb-2"
              style={{ color: '#F5A624', letterSpacing: '0.15em' }}
            >
              Content Library
            </p>
            <h1 className="text-3xl font-bold leading-tight mb-1.5" style={{ color: '#FFFFFF' }}>
              Media Library
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Manage your content and folders. Upload, organize, and deploy media to your displays.
            </p>
          </div>

          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold flex-shrink-0 mt-1 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#F5A624', color: '#000000' }}
          >
            <UploadCloud className="h-4 w-4" />
            Upload
          </button>
          <input
            id="file-upload" type="file" multiple className="hidden"
            onChange={(e) => e.target.files && handleUpload(e.target.files)}
          />
        </div>

        {/* Stat cards */}
        <div className="relative flex items-stretch gap-3 px-7 pb-5">
          {[
            { label: 'Total Files',   value: totalFiles.toString(),   Icon: FileText   },
            { label: 'Storage Used',  value: formatBytes(storageUsed), Icon: HardDrive  },
            { label: 'Images',        value: imageCount.toString(),    Icon: ImageIcon  },
            { label: 'Videos',        value: videoCount.toString(),    Icon: Film       },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1"
              style={{
                backgroundColor: 'rgba(0,0,0,0.28)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
              >
                <Icon className="h-4 w-4" style={{ color: '#6B7280' }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{label}</p>
                <p className="text-lg font-bold leading-tight" style={{ color: '#FFFFFF' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Upload progress ────────────────────────────────────── */}
      {Object.keys(uploadStatus).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadStatus).map(([fileId, status]) => {
            const progress = uploadProgress[fileId] || 0
            const fileName = fileId.split('-').slice(0, -2).join('-')
            return (
              <div key={fileId} className="rounded-xl p-3" style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" style={{ color: '#F5A624' }} />}
                    {status === 'success'   && <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#059669' }} />}
                    {status === 'error'     && <XCircle      className="h-4 w-4 flex-shrink-0" style={{ color: '#DC2626' }} />}
                    <span className="text-sm font-medium truncate" style={{ color: '#FFFFFF' }}>{fileName}</span>
                  </div>
                  <span className="text-xs ml-2 flex-shrink-0" style={{ color: '#6B7280' }}>
                    {status === 'uploading' ? `${Math.round(progress)}%` : status === 'success' ? 'Complete' : 'Failed'}
                  </span>
                </div>
                {status === 'uploading' && (
                  <div className="w-full rounded-full h-1 overflow-hidden" style={{ backgroundColor: '#2A2A2A' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#F5A624' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Folders section ────────────────────────────────────── */}
      {(isLoading || foldersLoading) ? (
        <div className="space-y-3">
          <div className="h-5 w-20 rounded animate-pulse" style={{ backgroundColor: '#1C1C1C' }} />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#1C1C1C' }} />
            ))}
          </div>
        </div>
      ) : filteredFolders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-4"
        >
          {/* Folders header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Folders</h2>
            <button
              onClick={() => { setParentFolderForNew(currentFolder); setIsCreatingFolder(true) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: '#9CA3AF' }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Folder
            </button>
          </div>

          {/* Folder cards */}
          <div className="grid grid-cols-3 gap-4">
            {filteredFolders.map((folder, i) => {
              const color = FOLDER_ACCENT_COLORS[i % FOLDER_ACCENT_COLORS.length]
              return (
                <button
                  key={folder.folder_id}
                  onClick={() => setCurrentFolder(folder.folder_id)}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all hover:opacity-90 w-full group"
                  style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
                >
                  {/* Folder icon */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}1A` }}
                  >
                    <FolderOpen className="h-5 w-5" style={{ color }} />
                  </div>
                  {/* Name + count */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#FFFFFF' }}>{folder.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      {(folder as any).content_count ?? 0} items
                    </p>
                  </div>
                  {/* Chevron */}
                  <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: '#6B7280' }} />
                </button>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── Content section ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16 }}
        className="space-y-4"
      >
        {/* Content toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">

          {/* Left: "Content" title + type filter tabs */}
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold" style={{ color: '#FFFFFF' }}>Content</h2>
            <div
              className="flex items-center gap-1 p-1 rounded-lg"
              style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A' }}
            >
              {(['all', 'image', 'video'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTypeFilter(tab)}
                  className="px-3 py-1 text-xs font-medium rounded-md transition-all"
                  style={
                    typeFilter === tab
                      ? { backgroundColor: '#F5A624', color: '#000000' }
                      : { color: '#9CA3AF' }
                  }
                >
                  {tab === 'all' ? 'All' : tab === 'image' ? 'Images' : 'Videos'}
                </button>
              ))}
            </div>
          </div>

          {/* Right: search + view toggle + sort + delete */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
                style={{ color: '#6B7280' }}
              />
              <input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-4 text-sm rounded-lg outline-none w-52"
                style={{ backgroundColor: '#1C1C1C', border: '1px solid #2A2A2A', color: '#FFFFFF' }}
              />
            </div>

            {/* Delete selected */}
            {selectedAssets.length > 0 && (
              <button
                onClick={() => handleDelete(selectedAssets)}
                className="h-9 px-3 text-sm font-medium rounded-lg"
                style={{
                  backgroundColor: 'rgba(220,38,38,0.12)',
                  border: '1px solid rgba(220,38,38,0.25)',
                  color: '#DC2626',
                }}
              >
                Delete ({selectedAssets.length})
              </button>
            )}
          </div>
        </div>

        {/* File grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="rounded-xl animate-pulse"
                style={{ backgroundColor: '#1C1C1C', aspectRatio: '3/4' }}
              />
            ))}
          </div>
        ) : filteredAssets.length === 0 && filteredFolders.length === 0 ? (
          <div className="py-20 text-center">
            <UploadCloud className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: '#6B7280' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#9CA3AF' }}>
              {searchQuery ? 'No items match your search' : 'Your media library is empty'}
            </p>
            <p className="text-xs mb-4" style={{ color: '#6B7280' }}>
              {searchQuery ? 'Try a different search term' : 'Upload images, videos, PDFs and more to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: '#F5A624', color: '#000000' }}
              >
                <UploadCloud className="h-4 w-4" />
                Upload Content
              </button>
            )}
          </div>
        ) : filteredAssets.length === 0 ? null : (
          <AnimatePresence>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset: any, idx: number) => {
                const isSelected = selectedAssets.includes(asset.content_id)
                const label      = getMimeLabel(asset)
                const badge      = BADGE[label]  ?? BADGE.FILE
                const previewBg  = PREVIEW_BG[label] ?? PREVIEW_BG.FILE
                const isVideo    = asset.content_type === 'video'
                const isPdf      = label === 'PDF'

                return (
                  <motion.div
                    key={asset.content_id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    onClick={() => toggleAssetSelection(asset.content_id)}
                    className="rounded-xl overflow-hidden cursor-pointer group"
                    style={{
                      backgroundColor: '#1C1C1C',
                      border: `1px solid ${isSelected ? '#F5A624' : '#2A2A2A'}`,
                    }}
                  >
                    {/* Preview area */}
                    <div
                      className="relative flex items-center justify-center"
                      style={{ height: '144px', background: previewBg }}
                    >
                      {/* Checkbox top-left */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{
                            backgroundColor: isSelected ? '#F5A624' : 'rgba(0,0,0,0.55)',
                            border: `1px solid ${isSelected ? '#F5A624' : 'rgba(255,255,255,0.18)'}`,
                          }}
                        >
                          {isSelected && (
                            <span className="text-[10px] font-bold leading-none" style={{ color: '#000' }}>✓</span>
                          )}
                        </div>
                      </div>

                      {/* File type badge top-right */}
                      <div className="absolute top-2.5 right-2.5 z-10">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: badge.bg, color: badge.color }}
                        >
                          {label}
                        </span>
                      </div>

                      {/* Preview content */}
                      {asset.url && asset.content_type === 'image' ? (
                        <img
                          src={asset.url}
                          alt={asset.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : isVideo ? (
                        /* Video play button */
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: 'rgba(20,184,166,0.22)',
                            border: '1px solid rgba(20,184,166,0.3)',
                          }}
                        >
                          <div
                            className="ml-0.5"
                            style={{
                              width: 0, height: 0,
                              borderTop: '7px solid transparent',
                              borderBottom: '7px solid transparent',
                              borderLeft: '12px solid #14B8A6',
                            }}
                          />
                        </div>
                      ) : isPdf ? (
                        <FileText className="h-10 w-10 opacity-40" style={{ color: '#F59E0B' }} />
                      ) : (
                        <ImageIcon className="h-10 w-10 opacity-25" style={{ color: '#9CA3AF' }} />
                      )}
                    </div>

                    {/* File info */}
                    <div className="px-3 py-2.5">
                      <p
                        className="text-sm font-semibold truncate leading-tight"
                        style={{ color: '#FFFFFF' }}
                      >
                        {asset.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                        {formatBytes(asset.size_bytes || 0)}
                        {asset.created_at && <span> · {timeAgo(asset.created_at)}</span>}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </AnimatePresence>
        )}
      </motion.div>

      {/* Create Folder Modal */}
      <CreateFolderModal
        isOpen={isCreatingFolder}
        onClose={() => { setIsCreatingFolder(false); setParentFolderForNew(null) }}
        onSubmit={handleFolderSubmit}
        parentFolderName={parentFolderName}
      />
    </div>
  )
}
