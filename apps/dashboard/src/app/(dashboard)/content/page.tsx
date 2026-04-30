'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, UploadCloud, ChevronRight, AlertCircle, FolderOpen,
  Loader2, CheckCircle2, XCircle, FileText, HardDrive,
  Image as ImageIcon, Film, Plus, Music,
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
import { toast } from '@/hooks/use-toast'
import type { Folder as FolderType } from '@signage/types'

// ── Design tokens ──────────────────────────────────────────────────────────
const FOLDER_ACCENT_COLORS = ['var(--color-primary)', '#7C3AED', '#059669', '#DC2626', '#3B82F6']

function getMimeLabel(asset: any): string {
  const mime: string = asset.mime_type || ''
  const name: string = (asset.name || '').toLowerCase()
  if (mime.includes('pdf'))   return 'PDF'
  if (mime.includes('presentation') || name.endsWith('.pptx') || name.endsWith('.ppt')) return 'PPT'
  if (mime.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) return 'DOC'
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
  PNG:  { bg: 'rgba(100,116,139,0.25)', color: 'var(--color-text-muted)' },
  JPG:  { bg: 'rgba(100,116,139,0.25)', color: 'var(--color-text-muted)' },
  GIF:  { bg: 'rgba(100,116,139,0.25)', color: 'var(--color-text-muted)' },
  WEBP: { bg: 'rgba(100,116,139,0.25)', color: 'var(--color-text-muted)' },
  PDF:  { bg: 'rgba(245,158,11,0.22)',  color: '#F59E0B' },
  PPT:  { bg: 'rgba(239,68,68,0.22)',   color: '#F87171' },
  DOC:  { bg: 'rgba(37,99,235,0.22)',   color: '#60A5FA' },
  MP4:  { bg: 'rgba(20,184,166,0.22)',  color: '#14B8A6' },
  PSD:  { bg: 'rgba(239,68,68,0.22)',   color: '#F87171' },
  ZIP:  { bg: 'rgba(100,116,139,0.25)', color: 'var(--color-text-muted)' },
  MP3:  { bg: 'rgba(124,58,237,0.22)',  color: '#A78BFA' },
  FILE: { bg: 'rgba(100,116,139,0.25)', color: 'var(--color-text-muted)' },
}

const PREVIEW_BG: Record<string, string> = {
  PNG:  'linear-gradient(145deg,var(--color-background) 0%,var(--color-surface-alt) 100%)',
  JPG:  'linear-gradient(145deg,var(--color-background) 0%,var(--color-surface-alt) 100%)',
  GIF:  'linear-gradient(145deg,var(--color-background) 0%,var(--color-surface-alt) 100%)',
  WEBP: 'linear-gradient(145deg,var(--color-background) 0%,var(--color-surface-alt) 100%)',
  PDF:  'linear-gradient(145deg,#FFFBEB 0%,#FEF3C7 100%)',
  PPT:  'linear-gradient(145deg,#FFF1F2 0%,#FFE4E6 100%)',
  DOC:  'linear-gradient(145deg,#EFF6FF 0%,#DBEAFE 100%)',
  MP4:  'linear-gradient(145deg,#F0FDFA 0%,#CCFBF1 100%)',
  PSD:  'linear-gradient(145deg,#FFF1F2 0%,#FFE4E6 100%)',
  ZIP:  'linear-gradient(145deg,var(--color-background) 0%,var(--color-surface-alt) 100%)',
  FILE: 'linear-gradient(145deg,var(--color-background) 0%,var(--color-surface-alt) 100%)',
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
  const [typeFilter, setTypeFilter]             = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all')

  const workspace          = useAuthStore((s) => s.workspace)
  const workspaces         = useAuthStore((s) => s.workspaces)
  const user               = useAuthStore((s) => s.user)
  const workspaceId: number | string = workspace?.id || (workspace as any)?.workspace_id || workspaces?.[0]?.id || (workspaces?.[0] as any)?.workspace_id || 0

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
    (typeFilter === 'all' || 
     (typeFilter === 'document' ? (a.content_type === 'document' || a.content_type === 'pdf') : a.content_type === typeFilter))
  )

  // Derived stats
  const totalFiles  = assets.length
  const storageUsed = (assets as any[]).reduce((acc, a) => acc + (a.size_bytes || 0), 0)
  const imageCount  = (assets as any[]).filter((a) => a.content_type === 'image').length
  const videoCount  = (assets as any[]).filter((a) => a.content_type === 'video').length
  const audioCount  = (assets as any[]).filter((a) => a.content_type === 'audio').length
  const docCount    = (assets as any[]).filter((a) => a.content_type === 'document' || a.content_type === 'pdf').length

  const parentFolderName = (allFolders as any[]).find((f) => f.folder_id === parentFolderForNew)?.name

  // ── Handlers (unchanged logic) ──────────────────────────────────────────

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const uploadFileWithRetry = async (file: File, fileId: string, wsId: number, maxRetries = 3): Promise<void> => {
    let uploadResponse: { id: number; content_id: string; upload_url: string; s3_key: string; expires_in: number } | null = null
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) await new Promise((r) => setTimeout(r, Math.pow(2, attempt - 1) * 1000))
        if (!uploadResponse) {
          uploadResponse = await uploadMutation.mutateAsync({
            workspaceId: wsId,
            data: { name: file.name, mime_type: file.type, size_bytes: file.size, folder_id: currentFolder || undefined },
          })
        }
        await uploadFileToS3(file, uploadResponse!.upload_url, {
          onProgress: (p) => setUploadProgress((prev) => ({ ...prev, [fileId]: p.percentage })),
        })
        await confirmUploadMutation.mutateAsync({ workspaceId: wsId, contentId: uploadResponse!.id })
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
    const store = useAuthStore.getState()
    const w = store.workspace
    const ws = store.workspaces
    const currentWorkspaceId = w?.id || (w as any)?.workspace_id || ws?.[0]?.id || (ws?.[0] as any)?.workspace_id || workspaceId
    if (!currentWorkspaceId) return toast.error('No workspace found. Please refresh and try again.')
    for (const file of Array.from(files)) {
      const fileId = `${file.name}-${file.size}-${Date.now()}`
      try {
        setUploadStatus((p) => ({ ...p, [fileId]: 'uploading' }))
        setUploadProgress((p) => ({ ...p, [fileId]: 0 }))
        await uploadFileWithRetry(file, fileId, currentWorkspaceId)
        setUploadStatus((p) => ({ ...p, [fileId]: 'success' }))
        setUploadProgress((p) => ({ ...p, [fileId]: 100 }))
        setTimeout(() => {
          setUploadStatus((p) => { const n = { ...p }; delete n[fileId]; return n })
          setUploadProgress((p) => { const n = { ...p }; delete n[fileId]; return n })
        }, 2000)
      } catch (err) {
        setUploadStatus((p) => ({ ...p, [fileId]: 'error' }))
        toast.error(`Upload failed: ${err instanceof Error ? err.message : 'Try again'}`)
        setTimeout(() => {
          setUploadStatus((p) => { const n = { ...p }; delete n[fileId]; return n })
          setUploadProgress((p) => { const n = { ...p }; delete n[fileId]; return n })
        }, 3000)
      }
    }
  }

  const handleDelete = async (ids: string[]) => {
    if (!workspaceId) return toast.error('Please select a workspace before deleting.')
    const folderIds = ids.filter((id) => id.startsWith('folder:')).map((id) => id.replace('folder:', ''))
    const contentIds = ids.filter((id) => id.startsWith('content:')).map((id) => id.replace('content:', ''))
    for (const folderId of folderIds) {
      try {
        await deleteFolderMutation.mutateAsync({ workspaceId, folderId })
        if (currentFolder === folderId) setCurrentFolder(null)
      } catch (err) { toast.error(`Delete folder failed: ${err instanceof Error ? err.message : 'Try again'}`) }
    }
    for (const contentId of contentIds) {
      try {
        await deleteMutation.mutateAsync({ workspaceId, contentId })
      } catch (err) { toast.error(`Delete content failed: ${err instanceof Error ? err.message : 'Try again'}`) }
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


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#DC2626' }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Failed to load content</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="page-container flex flex-col h-full" style={{ backgroundColor: '#f0f9ff' }}>

      {/* ── Hero banner (fixed) ──────────────────────────────── */}
      <div className="flex-shrink-0 pb-4 sm:pb-5">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface-alt) 50%, var(--color-border) 100%)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(color-mix(in srgb, var(--color-primary) 6%, transparent) 1px,transparent 1px),' +
              'linear-gradient(90deg,color-mix(in srgb, var(--color-primary) 6%, transparent) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Title row */}
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 responsive-hero pb-2">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p
                  className="text-[10px] uppercase font-semibold"
                  style={{ color: 'var(--color-primary)', letterSpacing: '0.15em' }}
                >
                  Content Library
                </p>
              </div>
              <h1 className="text-lg sm:text-xl font-bold leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                Media Library
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                Manage your content and folders. Upload, organize, and deploy media to your displays.
              </p>
            </div>
          </div>

          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90 touch-target self-start sm:self-center"
            style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
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
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 px-3 sm:px-5 pb-3">
          {[
            { label: 'Total Files',   value: totalFiles.toString(),   Icon: FileText   },
            { label: 'Images',        value: imageCount.toString(),    Icon: ImageIcon  },
            { label: 'Videos',        value: videoCount.toString(),    Icon: Film       },
            { label: 'Docs',          value: docCount.toString(),      Icon: FileText   },
            { label: 'Audio',         value: audioCount.toString(),    Icon: Music      },
            { label: 'Storage Used',  value: formatBytes(storageUsed), Icon: HardDrive  },
          ].map(({ label, value, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: 'rgba(255,255,255,0.75)',
                border: '1px solid color-mix(in srgb, var(--color-primary) 7%, transparent)',
                minWidth: 'fit-content'
              }}
            >
              <div
                className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: 'color-mix(in srgb, var(--color-primary) 7%, transparent)' }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: 'var(--color-text-muted)' }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
                <p className="text-sm font-bold leading-tight truncate" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
      </div>{/* end fixed header */}

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 sm:space-y-5 pb-4 sm:pb-5">

      {/* ── Upload progress ────────────────────────────────────── */}
      {Object.keys(uploadStatus).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadStatus).map(([fileId, status]) => {
            const progress = uploadProgress[fileId] || 0
            const fileName = fileId.split('-').slice(0, -2).join('-')
            return (
              <div key={fileId} className="rounded-xl p-3" style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" style={{ color: 'var(--color-primary)' }} />}
                    {status === 'success'   && <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: '#059669' }} />}
                    {status === 'error'     && <XCircle      className="h-4 w-4 flex-shrink-0" style={{ color: '#DC2626' }} />}
                    <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{fileName}</span>
                  </div>
                  <span className="text-xs ml-2 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    {status === 'uploading' ? `${Math.round(progress)}%` : status === 'success' ? 'Complete' : 'Failed'}
                  </span>
                </div>
                {status === 'uploading' && (
                  <div className="w-full rounded-full h-1 overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--color-primary)' }}
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
          <div className="h-5 w-20 rounded animate-pulse" style={{ backgroundColor: '#FFFFFF' }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: '#FFFFFF' }} />
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
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Folders</h2>
            <button
              onClick={() => { setParentFolderForNew(currentFolder); setIsCreatingFolder(true) }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              <Plus className="h-3.5 w-3.5" />
              New Folder
            </button>
          </div>

          {/* Folder cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredFolders.map((folder, i) => {
              const color = FOLDER_ACCENT_COLORS[i % FOLDER_ACCENT_COLORS.length]
              return (
                <button
                  key={folder.folder_id}
                  onClick={() => setCurrentFolder(folder.folder_id)}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl text-left transition-all hover:opacity-90 w-full group"
                  style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
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
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>{folder.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                      {(folder as any).content_count ?? 0} items
                    </p>
                  </div>
                  {/* Chevron */}
                  <ChevronRight className="h-4 w-4 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-text-muted)' }} />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          {/* Left: "Content" title + type filter tabs */}
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <h2 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>Content</h2>
            <div
              className="flex items-center gap-1 p-1 rounded-lg"
              style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)' }}
            >
              {(['all', 'image', 'video', 'audio', 'document'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setTypeFilter(tab)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md transition-all touch-target"
                  style={
                    typeFilter === tab
                      ? { backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }
                      : { color: 'var(--color-text-secondary)' }
                  }
                >
                  {tab === 'all' ? 'All' : tab === 'image' ? 'Images' : tab === 'video' ? 'Videos' : tab === 'audio' ? 'Audio' : 'Docs'}
                </button>
              ))}
            </div>
          </div>

          {/* Right: search + delete */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--color-text-muted)' }}
              />
              <input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-4 text-sm rounded-lg outline-none w-full sm:w-52"
                style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
              />
            </div>

            {/* Delete selected */}
            {selectedAssets.length > 0 && (
              <button
                onClick={() => handleDelete(selectedAssets)}
                className="h-9 px-3 text-sm font-medium rounded-lg flex-shrink-0 touch-target"
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
                style={{ backgroundColor: '#FFFFFF', aspectRatio: '3/4' }}
              />
            ))}
          </div>
        ) : filteredAssets.length === 0 && filteredFolders.length === 0 ? (
          <div className="py-20 text-center">
            <UploadCloud className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
              {searchQuery ? 'No items match your search' : 'Your media library is empty'}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {searchQuery ? 'Try a different search term' : 'Upload images, videos, PDFs and more to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ backgroundColor: 'var(--color-primary)', color: '#FFFFFF' }}
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
                const contentSelectId = `content:${asset.content_id}`
                const isSelected = selectedAssets.includes(contentSelectId)
                const label      = getMimeLabel(asset)
                const badge      = BADGE[label]  ?? BADGE.FILE
                const previewBg  = PREVIEW_BG[label] ?? PREVIEW_BG.FILE
                const isVideo    = asset.content_type === 'video'
                const isPdf      = label === 'PDF'
                const isDocument = asset.content_type === 'document'

                return (
                  <motion.div
                    key={asset.content_id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    onClick={() => toggleAssetSelection(contentSelectId)}
                    className="rounded-xl overflow-hidden cursor-pointer group"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
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
                            backgroundColor: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.75)',
                            border: `1px solid ${isSelected ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 25%, transparent)'}`,
                          }}
                        >
                          {isSelected && (
                            <span className="text-[10px] font-bold leading-none" style={{ color: '#fff' }}>✓</span>
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
                      {isVideo ? (
                        <>
                          {asset.thumbnail_url && (
                            <img
                              src={asset.thumbnail_url}
                              alt={asset.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                            />
                          )}
                          <div
                            className="w-11 h-11 rounded-full flex items-center justify-center relative z-10"
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
                        </>
                      ) : isPdf ? (
                        <>
                          {asset.thumbnail_url && (
                            <img
                              src={asset.thumbnail_url}
                              alt={asset.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                            />
                          )}
                          {!asset.thumbnail_url && (
                            <FileText className="h-10 w-10 opacity-40" style={{ color: '#F59E0B' }} />
                          )}
                        </>
                      ) : isDocument ? (
                        <>
                          {asset.thumbnail_url && (
                            <img
                              src={asset.thumbnail_url}
                              alt={asset.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                            />
                          )}
                          {!asset.thumbnail_url && (
                            <FileText className="h-10 w-10 opacity-40" style={{ color: 'var(--color-text-muted)' }} />
                          )}
                        </>
                      ) : label === 'MP3' ? (
                        <>
                          <Music className="h-10 w-10 opacity-40" style={{ color: '#A78BFA' }} />
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-10 w-10 opacity-25" style={{ color: 'var(--color-text-muted)' }} />
                          {(asset.url || asset.thumbnail_url) && asset.content_type === 'image' && (
                            <img
                              src={asset.thumbnail_url || asset.url}
                              alt={asset.name}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                            />
                          )}
                        </>
                      )}
                    </div>

                    {/* File info */}
                    <div className="px-3 py-2.5">
                      <p
                        className="text-sm font-semibold truncate leading-tight"
                        style={{ color: 'var(--color-text-primary)' }}
                      >
                        {asset.name}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
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

      </div>{/* end scrollable content */}

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
