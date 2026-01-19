'use client'

import { Button, Input, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { FileImage, FileVideo, Folder, FolderOpen, Search, UploadCloud, AlertCircle, FolderPlus, ChevronRight, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useContent, useFolders, useAllFolders, useUploadContent, useDeleteContent, useCreateFolder, useDeleteFolder, useConfirmUpload } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import { formatBytes } from '@/lib/utils'
import { CreateFolderModal } from '@/components/content/CreateFolderModal'
import { motion, AnimatePresence } from 'framer-motion'
import { fadeInUpVariants } from '@/lib/animations'
import { uploadFileToS3 } from '@/lib/upload'
import type { Folder as FolderType } from '@signage/types'

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [parentFolderForNew, setParentFolderForNew] = useState<string | null>(null)
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'uploading' | 'success' | 'error'>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)

  const workspace = useAuthStore((state) => state.workspace)
  const user = useAuthStore((state) => state.user)
  const isLoadingWorkspace = useAuthStore((state) => state.isLoading)
  const workspaceId = workspace?.workspace_id || ''
  
  const isWaitingForWorkspace = !workspace && !!user && !isLoadingWorkspace

  const { data: contentData, isLoading, error } = useContent(workspaceId, {
    search: searchQuery || undefined,
    folder_id: currentFolder || undefined,
  })
  const { data: foldersResponse, isLoading: foldersLoading } = useFolders(workspaceId, currentFolder)
  const { data: allFoldersResponse } = useAllFolders(workspaceId)
  const uploadMutation = useUploadContent()
  const confirmUploadMutation = useConfirmUpload()
  const deleteMutation = useDeleteContent()
  const createFolderMutation = useCreateFolder()
  const deleteFolderMutation = useDeleteFolder()

  const assets = Array.isArray(contentData) ? contentData : contentData?.items || []
  const currentFolders = Array.isArray(foldersResponse) ? foldersResponse : []
  const allFolders = Array.isArray(allFoldersResponse) ? allFoldersResponse : []
  
  const filteredFolders = currentFolders.filter((folder: FolderType) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const filteredAssets = assets.filter((asset: any) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  type CombinedItem = {
    type: 'folder' | 'content'
    id: string
    name: string
    [key: string]: any
  }
  
  const combinedItems: CombinedItem[] = [
    ...filteredFolders.map((folder: any) => ({
      type: 'folder' as const,
      id: folder.folder_id,
      name: folder.name,
      content_count: folder.content_count,
      created_at: folder.created_at,
      ...folder
    })),
    ...filteredAssets.map((asset: any) => ({
      type: 'content' as const,
      id: asset.content_id,
      name: asset.name,
      ...asset
    }))
  ]

  const toggleAssetSelection = (id: string) => {
    setSelectedAssets(prev =>
      prev.includes(id)
        ? prev.filter(assetId => assetId !== id)
        : [...prev, id]
    )
  }

  const uploadFileWithRetry = async (
    file: File,
    fileId: string,
    maxRetries: number = 3
  ): Promise<void> => {
    let uploadResponse: { content_id: string; upload_url: string; s3_key: string; expires_in: number } | null = null
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
        }

        if (!uploadResponse) {
          uploadResponse = await uploadMutation.mutateAsync({
            workspaceId,
            data: {
              name: file.name,
              mime_type: file.type,
              size_bytes: file.size,
              folder_id: currentFolder || undefined,
            }
          })
        }

        await uploadFileToS3(file, uploadResponse.upload_url, {
          onProgress: (progress) => {
            setUploadProgress(prev => ({ ...prev, [fileId]: progress.percentage }))
          }
        })

        await confirmUploadMutation.mutateAsync({
          workspaceId,
          contentId: uploadResponse.content_id
        })

        return
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error')
        
        const errorMessage = lastError.message.toLowerCase()
        if (errorMessage.includes('status 4') || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
          uploadResponse = null
        }
        
        if (attempt < maxRetries) {
          continue
        }
        throw lastError
      }
    }
    
    throw lastError || new Error('Upload failed after retries')
  }

  const handleUpload = async (files: FileList | File[]) => {
    if (!workspaceId) {
      alert('Please select a workspace before uploading content.')
      return
    }

    const fileArray = Array.from(files)
    for (const file of fileArray) {
      const fileId = `${file.name}-${file.size}-${Date.now()}`
      
      try {
        setUploadStatus(prev => ({ ...prev, [fileId]: 'uploading' }))
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }))

        await uploadFileWithRetry(file, fileId)

        setUploadStatus(prev => ({ ...prev, [fileId]: 'success' }))
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }))

        setTimeout(() => {
          setUploadStatus(prev => {
            const newStatus = { ...prev }
            delete newStatus[fileId]
            return newStatus
          })
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 2000)
      } catch (error) {
        setUploadStatus(prev => ({ ...prev, [fileId]: 'error' }))
        const errorMessage = error instanceof Error ? error.message : 'Failed to upload file. Please try again.'
        alert(`Upload failed: ${errorMessage}`)
        
        setTimeout(() => {
          setUploadStatus(prev => {
            const newStatus = { ...prev }
            delete newStatus[fileId]
            return newStatus
          })
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[fileId]
            return newProgress
          })
        }, 3000)
      }
    }
  }

  const handleDelete = async (ids: string[]) => {
    if (!workspaceId) {
      alert('Please select a workspace before deleting items.')
      return
    }

    const folderIds: string[] = []
    const contentIds: string[] = []

    ids.forEach(id => {
      const isFolder = allFolders.some((folder: FolderType) => folder.folder_id === id)
      if (isFolder) {
        folderIds.push(id)
      } else {
        contentIds.push(id)
      }
    })

    for (const folderId of folderIds) {
      try {
        await deleteFolderMutation.mutateAsync({ workspaceId, folderId })
        if (currentFolder === folderId) {
          setCurrentFolder(null)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete folder. Please try again.'
        alert(`Delete folder failed: ${errorMessage}`)
      }
    }

    for (const contentId of contentIds) {
      try {
        await deleteMutation.mutateAsync({ workspaceId, contentId })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete content. Please try again.'
        alert(`Delete content failed: ${errorMessage}`)
      }
    }
    setSelectedAssets([])
  }

  const handleCreateFolder = (parentId: string | null) => {
    setParentFolderForNew(parentId)
    setIsCreatingFolder(true)
  }

  const handleFolderSubmit = async (name: string) => {
    if (!workspaceId) {
      alert('Please select a workspace before creating a folder.')
      return
    }

    try {
      await createFolderMutation.mutateAsync({
        workspaceId,
        data: {
          name,
          parent_id: parentFolderForNew || undefined,
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create folder. Please try again.'
      throw new Error(errorMessage)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolderMutation.mutateAsync({ workspaceId, folderId })
      if (currentFolder === folderId) {
        setCurrentFolder(null)
      }
    } catch (error) {
      console.error('Delete folder failed:', error)
      alert('Failed to delete folder. It may contain content.')
    }
  }

  const getBreadcrumbPath = () => {
    const path: Array<{ id: string | null; name: string }> = [{ id: null, name: 'All Content' }]
    if (currentFolder) {
      const findParents = (folderId: string): any[] => {
        const folder = allFolders.find((f: any) => f.folder_id === folderId)
        if (!folder) return []
        const parents = folder.parent_id ? findParents(folder.parent_id) : []
        return [...parents, folder]
      }
      const folderPath = findParents(currentFolder)
      folderPath.forEach((f: any) => {
        path.push({ id: f.folder_id, name: f.name })
      })
    }
    return path
  }

  const breadcrumbs = getBreadcrumbPath()
  const parentFolderName = allFolders.find((f: any) => f.folder_id === parentFolderForNew)?.name

  if (isLoadingWorkspace || (user && !workspace)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">Loading workspace...</h2>
          <p className="text-text-secondary">Please wait while we load your workspace</p>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">No workspace available</h2>
          <p className="text-text-secondary mb-4">Please create a workspace to get started</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-text-primary mb-2">Failed to load content</h2>
          <p className="text-text-secondary mb-4">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
        <div className="glass-light sticky top-0 z-10 border-b border-border/50">
          <div className="px-8 py-6">
            <motion.div variants={fadeInUpVariants} className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.id || 'root'} className="flex items-center gap-2">
                      {index > 0 && <ChevronRight className="h-3 w-3" />}
                      <button
                        onClick={() => setCurrentFolder(crumb.id)}
                        className={`hover:text-primary transition-colors ${
                          index === breadcrumbs.length - 1 ? 'font-medium text-text-secondary' : ''
                        }`}
                      >
                        {crumb.name}
                      </button>
                    </div>
                  ))}
                </div>
                <h1 className="text-2xl font-semibold text-text-primary tracking-tight">Media Library</h1>
                <p className="text-sm text-text-secondary mt-1">Manage your content and folders</p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={() => handleCreateFolder(currentFolder)}
                  variant="outline"
                  className="gap-2 rounded-xl border-border/50 bg-surface/50 hover:bg-surface"
                >
                  <FolderPlus className="h-4 w-4" /> New Folder
                </Button>
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="bg-primary hover:bg-primary-hover text-white gap-2 shadow-lg rounded-xl"
                >
                  <UploadCloud className="h-4 w-4" /> Upload
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={(e) => e.target.files && handleUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </motion.div>

            {Object.keys(uploadStatus).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                {Object.entries(uploadStatus).map(([fileId, status]) => {
                  const progress = uploadProgress[fileId] || 0
                  const fileName = fileId.split('-').slice(0, -2).join('-')
                  
                  return (
                    <div
                      key={fileId}
                      className="bg-surface border border-border rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {status === 'uploading' && <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />}
                          {status === 'success' && <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />}
                          {status === 'error' && <XCircle className="h-4 w-4 text-error flex-shrink-0" />}
                          <span className="text-sm font-medium text-text-primary truncate">{fileName}</span>
                        </div>
                        <span className="text-xs text-text-muted ml-2 flex-shrink-0">
                          {status === 'uploading' && `${Math.round(progress)}%`}
                          {status === 'success' && 'Complete'}
                          {status === 'error' && 'Failed'}
                        </span>
                      </div>
                      {status === 'uploading' && (
                        <div className="w-full bg-surface-alt rounded-full h-1.5 overflow-hidden">
                          <motion.div
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            )}

            <motion.div variants={fadeInUpVariants} className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-surface/50 border-border/50 focus:border-primary/30 rounded-xl"
                />
              </div>

              {selectedAssets.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => handleDelete(selectedAssets)}
                  className="text-error border-error hover:bg-error/10 rounded-xl"
                >
                  Delete ({selectedAssets.length})
                </Button>
              )}
            </motion.div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          {isLoading || foldersLoading ? (
            <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          ) : filteredFolders.length === 0 && filteredAssets.length === 0 ? (
            <EmptyState
              title={searchQuery ? 'No items found' : 'Your media library is empty'}
              description={searchQuery ? 'Try adjusting your search query' : 'Upload images, videos, PDFs and more to get started'}
              action={!searchQuery ? {
                label: "Upload Content",
                onClick: () => document.getElementById('file-upload')?.click(),
                icon: <UploadCloud className="h-4 w-4" />
              } : undefined}
            />
          ) : (
            <div className="space-y-8">
              {filteredFolders.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Folders</h2>
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    <AnimatePresence>
                      {filteredFolders.map((folder: FolderType, index: number) => (
                        <motion.div
                          key={folder.folder_id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                          onClick={() => setCurrentFolder(folder.folder_id)}
                          className="group cursor-pointer"
                        >
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-border hover:border-primary transition-all bg-gradient-to-br from-primary/5 to-primary/10">
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                              <FolderOpen className="h-6 w-6 text-primary/60 mb-1" />
                              <p className="text-text-primary text-xs font-medium text-center truncate w-full px-1">{folder.name}</p>
                              {folder.content_count > 0 && (
                                <p className="text-text-muted text-[10px] mt-0.5">{folder.content_count} {folder.content_count === 1 ? 'item' : 'items'}</p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {filteredAssets.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Content</h2>
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    <AnimatePresence>
                      {filteredAssets.map((asset: any, index: number) => {
                        const isSelected = selectedAssets.includes(asset.content_id)
                        
                        return (
                          <motion.div
                            key={asset.content_id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.02, duration: 0.2 }}
                            onClick={() => toggleAssetSelection(asset.content_id)}
                            className="group cursor-pointer"
                          >
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-surface border border-border hover:border-primary transition-all">
                              {asset.url && asset.content_type === 'image' ? (
                                <img 
                                  src={asset.url} 
                                  alt={asset.name}
                                  className="absolute inset-0 w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                    const fallback = e.currentTarget.nextElementSibling
                                    if (fallback) (fallback as HTMLElement).style.display = 'flex'
                                  }}
                                />
                              ) : null}
                              
                              <div className="absolute inset-0 flex items-center justify-center bg-surface-alt" style={{ display: asset.url && asset.content_type === 'image' ? 'none' : 'flex' }}>
                                {asset.content_type === 'image' ? <FileImage className="h-4 w-4 text-text-muted/30" /> :
                                 asset.content_type === 'video' ? <FileVideo className="h-4 w-4 text-text-muted/30" /> :
                                 <FileImage className="h-4 w-4 text-text-muted/30" />}
                              </div>

                              <div className="absolute top-1 right-1">
                                <div className="px-1 py-0.5 rounded bg-surface/90 backdrop-blur-sm text-[10px] font-medium text-text-primary border border-border">
                                  {asset.content_type}
                                </div>
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 to-transparent">
                                <p className="text-white text-[10px] font-medium truncate">{asset.name}</p>
                                <p className="text-white/70 text-[8px] mt-0.5">{formatBytes(asset.size_bytes)}</p>
                              </div>

                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                    <span className="text-xs">✓</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      <CreateFolderModal
        isOpen={isCreatingFolder}
        onClose={() => {
          setIsCreatingFolder(false)
          setParentFolderForNew(null)
        }}
        onSubmit={handleFolderSubmit}
        parentFolderName={parentFolderName}
      />
    </div>
  )
}
