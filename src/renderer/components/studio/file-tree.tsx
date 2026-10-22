import { useState } from 'react'
import { FileCode, FilePlus, Trash2, Folder, FileText } from 'lucide-react'
import { VirtualFile } from './virtual-fs'
import { Button } from '@/components/ui/button'

interface FileTreeProps {
  files: VirtualFile[]
  activeFile: string
  onSelectFile: (name: string) => void
  onCreateFile: (name: string) => void
  onDeleteFile: (name: string) => void
}

export function FileTree({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}: FileTreeProps) {
  function handleAdd() {
    const name = prompt('Enter filename (e.g., styles.css, script.js):')
    if (name) onCreateFile(name)
  }

  return (
    <div className="flex flex-col h-full w-56 border-r border-border bg-card/60 select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Folder className="size-3.5 text-primary" />
          <span>Files</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAdd}
          className="size-6 text-muted-foreground hover:text-foreground"
          title="Add File"
        >
          <FilePlus className="size-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {files.map((f) => {
          const isActive = f.name === activeFile
          return (
            <div
              key={f.name}
              onClick={() => onSelectFile(f.name)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors group ${
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode className="size-3.5 shrink-0" />
                <span className="truncate">{f.name}</span>
              </div>

              {f.name !== 'index.html' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Delete ${f.name}?`)) onDeleteFile(f.name)
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive p-0.5"
                >
                  <Trash2 className="size-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
