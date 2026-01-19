'use client'

import { useState, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button, Input } from '@/components/ui'
import { Search, FileImage, FileVideo, FileText, File, X, Folder, FolderOpen, ChevronRight, Home } from 'lucide-react'
import { useContent, useFolders, useAllFolders } from '@/hooks/queries'
import { useAuthStore } from '@/stores/auth-store'
import type { Content, Folder as FolderType } from '@signage/types'
import { motion } from 'framer-motion'
import { formatBytes, formatDate } from '@/lib/utils'

interface ContentSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (content: Content) => void
  acceptedTypes?: string[]
  currentContentId?: string
}

const getContentIcon = (contentType: string) => {
  if (contentType.startsWith('image/')) return FileImage
  if (contentType.startsWith('video/')) return FileVideo
  if (contentType.includes('pdf')) return FileText
  return File
}

const getContentTypeLabel = (contentType: string) => {
  if (contentType.startsWith('image/')) return 'Image'
  if (contentType.startsWith('video/')) return 'Video'
  if (contentType.includes('pdf')) return 'PDF'
  return 'File'
}

export function ContentSelector({
  isOpen,
  onClose,
  onSelect,
  acceptedTypes,
  currentContentId
}: ContentSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const workspace = useAuthStore((state) => state.workspace)
  const workspaceId = workspace?.workspace_id || ''

  const { data: contentData, isLoading } = useContent(workspaceId, {
    search: searchQuery || undefined,
    folder_id: currentFolder || undefined,
  })
  const { data: foldersResponse, isLoading: foldersLoading } = useFolders(workspaceId, currentFolder)
  const { data: allFoldersResponse } = useAllFolders(workspaceId)

  const assets = Array.isArray(contentData) ? contentData : contentData?.items || []
  const currentFolders = Array.isArray(foldersResponse) ? foldersResponse : []
  const allFolders = Array.isArray(allFoldersResponse) ? allFoldersResponse : []

  const filteredFolders = useMemo(() => {
    return currentFolders.filter((folder: FolderType) =>
      folder.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [currentFolders, searchQuery])

  const filteredContent = useMemo(() => {
    const contentList = assets
    
    return contentList.filter((item: Content) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      if (acceptedTypes && acceptedTypes.length > 0) {
        const matchesType = acceptedTypes.some(type => 
          item.content_type.startsWith(type.replace('/*', ''))
        )
        return matchesSearch && matchesType
      }
      
      return matchesSearch
    })
  }, [assets, searchQuery, acceptedTypes])

  const getBreadcrumbPath = () => {
    if (!currentFolder) return []
    
    const path: FolderType[] = []
    let folderId = currentFolder
    
    while (folderId) {
      const folder = allFolders.find((f: FolderType) => f.folder_id === folderId)
      if (!folder) break
      path.unshift(folder)
      folderId = folder.parent_id
    }
    
    return path
  }

  const breadcrumbPath = getBreadcrumbPath()

  const handleFolderClick = (folderId: string) => {
    setCurrentFolder(folderId)
  }

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolder(folderId)
  }

  const handleSelect = (content: Content) => {
    onSelect(content)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Select Content</DialogTitle>
              <p className="text-sm text-text-secondary mt-1">
                {acceptedTypes && acceptedTypes.length > 0
                  ? `Choose from ${acceptedTypes.join(', ')} files`
                  : 'Choose content from your library'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {breadcrumbPath.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-text-muted">
              <button
                onClick={() => handleBreadcrumbClick(null)}
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Home</span>
              </button>
              {breadcrumbPath.map((folder, index) => (
                <div key={folder.folder_id} className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5" />
                  <button
                    onClick={() => handleBreadcrumbClick(folder.folder_id)}
                    className={`hover:text-primary transition-colors ${
                      index === breadcrumbPath.length - 1 ? 'text-text-primary font-medium' : ''
                    }`}
                  >
                    {folder.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto border border-border rounded-lg p-4">
          {isLoading || foldersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-text-muted">Loading...</div>
            </div>
          ) : filteredFolders.length === 0 && filteredContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <File className="h-12 w-12 text-text-muted mb-3" />
              <p className="text-text-muted">
                {searchQuery ? 'No folders or content found' : 'No folders or content available'}
              </p>
              {searchQuery && (
                <p className="text-sm text-text-muted mt-1">Try a different search term</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFolders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Folders</h3>
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {filteredFolders.map((folder: FolderType) => (
                      <motion.button
                        key={folder.folder_id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => handleFolderClick(folder.folder_id)}
                        className="flex flex-col items-center p-2 rounded-lg hover:bg-surface-alt transition-colors group"
                      >
                        <div className="w-full aspect-square rounded-lg bg-primary/10 flex items-center justify-center mb-1.5 group-hover:bg-primary/20 transition-colors">
                          <Folder className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs text-text-primary font-medium truncate w-full text-center">
                          {folder.name}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {folder.content_count || 0} items
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {filteredContent.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-text-secondary mb-3">Content</h3>
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {filteredContent.map((content: Content) => {
                      const Icon = getContentIcon(content.content_type)
                      const isSelected = content.content_id === currentContentId

                      return (
                        <motion.button
                          key={content.content_id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => handleSelect(content)}
                          className={`flex flex-col items-center p-2 rounded-lg transition-colors group ${
                            isSelected ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-surface-alt'
                          }`}
                        >
                          <div className={`w-full aspect-square rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                            isSelected ? 'bg-primary/20' : 'bg-surface-alt group-hover:bg-surface'
                          }`}>
                            <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-text-muted'}`} />
                          </div>
                          <span className={`text-xs font-medium truncate w-full text-center ${
                            isSelected ? 'text-primary' : 'text-text-primary'
                          }`}>
                            {content.name}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {getContentTypeLabel(content.content_type)}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-text-muted">
            {filteredFolders.length > 0 && `${filteredFolders.length} ${filteredFolders.length === 1 ? 'folder' : 'folders'}`}
            {filteredFolders.length > 0 && filteredContent.length > 0 && ' · '}
            {filteredContent.length > 0 && `${filteredContent.length} ${filteredContent.length === 1 ? 'item' : 'items'}`}
          </p>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
