'use client'

import { useState } from 'react'
import { Folder, FolderPlus, FolderOpen, ChevronRight, ChevronDown, MoreHorizontal, Trash2, Edit } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Folder as FolderType } from '@signage/types'

interface FolderTreeProps {
  folders: FolderType[]
  currentFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onCreateFolder: (parentId: string | null) => void
  onDeleteFolder: (folderId: string) => void
  onRenameFolder?: (folderId: string) => void
}

export function FolderTree({ 
  folders, 
  currentFolderId, 
  onFolderSelect, 
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder 
}: FolderTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{ folderId: string; x: number; y: number } | null>(null)

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const buildFolderTree = (parentId: string | null = null): FolderType[] => {
    return folders
      .filter(f => f.parent_id === parentId)
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    setContextMenu({ folderId, x: e.clientX, y: e.clientY })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const FolderItem = ({ folder, depth = 0 }: { folder: FolderType; depth?: number }) => {
    const children = buildFolderTree(folder.folder_id)
    const hasChildren = children.length > 0
    const isExpanded = expandedFolders.has(folder.folder_id)
    const isSelected = currentFolderId === folder.folder_id

    return (
      <div>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer group ${
            isSelected 
              ? 'bg-primary/10 text-primary' 
              : 'hover:bg-surface-alt text-text-secondary hover:text-text-primary'
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => onFolderSelect(folder.folder_id)}
          onContextMenu={(e) => handleContextMenu(e, folder.folder_id)}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleFolder(folder.folder_id)
              }}
              className="p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          {isExpanded && hasChildren ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
          
          <span className="flex-1 text-sm truncate">{folder.name}</span>
          
          <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100">
            {folder.content_count || 0}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              handleContextMenu(e, folder.folder_id)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-alt rounded"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {children.map(child => (
              <FolderItem key={child.folder_id} folder={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const rootFolders = buildFolderTree(null)

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3 px-3">
        <h3 className="text-sm font-semibold text-text-primary">Folders</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCreateFolder(null)}
          className="h-7 w-7"
          title="Create folder"
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={`px-2 py-1.5 rounded-lg cursor-pointer mb-1 ${
          currentFolderId === null 
            ? 'bg-primary/10 text-primary' 
            : 'hover:bg-surface-alt text-text-secondary'
        }`}
        onClick={() => onFolderSelect(null)}
      >
        <div className="flex items-center gap-2 px-3 py-1">
          <Folder className="h-4 w-4" />
          <span className="text-sm">All Content</span>
        </div>
      </div>

      <div className="space-y-0.5">
        {rootFolders.map(folder => (
          <FolderItem key={folder.folder_id} folder={folder} />
        ))}
      </div>

      {rootFolders.length === 0 && (
        <div className="text-center py-8 text-text-muted">
          <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs">No folders yet</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCreateFolder(null)}
            className="mt-2 text-xs"
          >
            Create Folder
          </Button>
        </div>
      )}

      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-50 bg-surface border border-border rounded-lg shadow-lg py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => {
                onCreateFolder(contextMenu.folderId)
                closeContextMenu()
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-surface-alt flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              New Subfolder
            </button>
            {onRenameFolder && (
              <button
                onClick={() => {
                  onRenameFolder(contextMenu.folderId)
                  closeContextMenu()
                }}
                className="w-full px-3 py-2 text-sm text-left hover:bg-surface-alt flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Rename
              </button>
            )}
            <button
              onClick={() => {
                if (confirm('Delete this folder and all its contents?')) {
                  onDeleteFolder(contextMenu.folderId)
                }
                closeContextMenu()
              }}
              className="w-full px-3 py-2 text-sm text-left hover:bg-error/10 text-error flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  )
}
