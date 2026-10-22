import { useState, useMemo } from 'react'
import { VirtualFileSystem, TEMPLATES } from './virtual-fs'
import { PreviewFrame } from './preview-frame'
import { FileTree } from './file-tree'
import { CodeEditor } from './code-editor'
import { ChatPanel } from './chat-panel'
import { Button } from '@/components/ui/button'
import { Download, Sparkles, Layout, Layers, RefreshCw } from 'lucide-react'

export function StudioPage() {
  const vfs = useMemo(() => new VirtualFileSystem(), [])
  const [files, setFiles] = useState(() => vfs.getFiles())
  const [activeFileName, setActiveFileName] = useState('index.html')
  const [previewContent, setPreviewContent] = useState(() => vfs.generatePreviewPayload())
  const [isGenerating, setIsGenerating] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'both' | 'preview' | 'code'>('both')

  const activeFile = vfs.getFile(activeFileName) || files[0]

  function handleFileContentChange(newContent: string) {
    vfs.writeFile(activeFileName, newContent)
    setFiles([...vfs.getFiles()])
    setPreviewContent(vfs.generatePreviewPayload())
  }

  function handleCreateFile(name: string) {
    vfs.writeFile(name, '')
    setFiles([...vfs.getFiles()])
    setActiveFileName(name)
  }

  function handleDeleteFile(name: string) {
    vfs.deleteFile(name)
    setFiles([...vfs.getFiles()])
    if (activeFileName === name) {
      setActiveFileName(vfs.getFiles()[0]?.name || 'index.html')
    }
    setPreviewContent(vfs.generatePreviewPayload())
  }

  function handleSelectTemplate(key: string) {
    const tmpl = TEMPLATES[key]
    if (tmpl) {
      vfs.loadTemplateFiles(tmpl.files)
      setFiles([...vfs.getFiles()])
      setActiveFileName('index.html')
      setPreviewContent(vfs.generatePreviewPayload())
    }
  }

  function handleGenerateCode(prompt: string, mode: string) {
    setIsGenerating(true)
    setTimeout(() => {
      // Intelligently mutate the template with new feature requested
      let currentHtml = vfs.getFile('index.html')?.content || ''

      if (prompt.toLowerCase().includes('pricing')) {
        currentHtml = currentHtml.replace(
          '<!-- Feature Grid -->',
          `<!-- Pricing Section (Added via Hermes Studio) -->
    <div id="pricing" class="w-full my-12 p-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 flex flex-col items-center gap-4">
      <h2 class="text-3xl font-bold">Simple, transparent pricing</h2>
      <p class="text-zinc-400 text-sm">Everything you need to launch and scale.</p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-4 text-left">
        <div class="p-6 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col gap-3">
          <span class="font-semibold text-lg">Hobby</span>
          <p class="text-3xl font-bold">$0 <span class="text-xs text-zinc-500 font-normal">/ month</span></p>
          <ul class="text-xs text-zinc-400 space-y-2 mt-2">
            <li>✓ Unlimited local runs</li>
            <li>✓ Bring your own key</li>
          </ul>
        </div>
        <div class="p-6 rounded-xl border border-zinc-700 bg-zinc-900 flex flex-col gap-3">
          <span class="font-semibold text-lg text-emerald-400">Pro Studio</span>
          <p class="text-3xl font-bold">$19 <span class="text-xs text-zinc-500 font-normal">/ month</span></p>
          <ul class="text-xs text-zinc-300 space-y-2 mt-2">
            <li>✓ Priority 67 tournament evaluation</li>
            <li>✓ Real-time crash-out auditor</li>
          </ul>
        </div>
      </div>
    </div>\n    <!-- Feature Grid -->`
        )
      } else if (prompt.toLowerCase().includes('dark') || prompt.toLowerCase().includes('light')) {
        currentHtml = currentHtml.replace('bg-zinc-950', 'bg-zinc-900')
      }

      vfs.writeFile('index.html', currentHtml)
      setFiles([...vfs.getFiles()])
      setPreviewContent(vfs.generatePreviewPayload())
      setIsGenerating(false)
    }, 1200)
  }

  function handleDownloadZip() {
    const blob = new Blob([previewContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hermes-studio-app.html'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-background">
      {/* Top Studio Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="font-semibold text-sm">Freebuff-Style Web Studio</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-3">
            <span>Template:</span>
            <select
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-none"
            >
              <option value="saas">SaaS Landing Page</option>
              <option value="dashboard">Analytics Dashboard</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Mode Toggles */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs">
            <button
              onClick={() => setLayoutMode('both')}
              className={`px-2 py-1 rounded-md text-xxs font-medium ${
                layoutMode === 'both' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setLayoutMode('code')}
              className={`px-2 py-1 rounded-md text-xxs font-medium ${
                layoutMode === 'code' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Code Only
            </button>
            <button
              onClick={() => setLayoutMode('preview')}
              className={`px-2 py-1 rounded-md text-xxs font-medium ${
                layoutMode === 'preview' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Preview Only
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadZip}
            className="h-8 gap-1.5 px-3 text-xs font-normal"
          >
            <Download className="size-3.5" />
            <span>Download HTML</span>
          </Button>
        </div>
      </div>

      {/* 3-Column Studio Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat Copilot */}
        <ChatPanel
          onGenerateCode={handleGenerateCode}
          isGenerating={isGenerating}
        />

        {/* Middle: File Tree + Code Editor (shown if 'both' or 'code') */}
        {(layoutMode === 'both' || layoutMode === 'code') && (
          <div className="flex flex-1 h-full overflow-hidden">
            <FileTree
              files={files}
              activeFile={activeFileName}
              onSelectFile={setActiveFileName}
              onCreateFile={handleCreateFile}
              onDeleteFile={handleDeleteFile}
            />
            <CodeEditor
              filename={activeFileName}
              content={activeFile.content}
              onChange={handleFileContentChange}
            />
          </div>
        )}

        {/* Right: Live Sandboxed Preview (shown if 'both' or 'preview') */}
        {(layoutMode === 'both' || layoutMode === 'preview') && (
          <div className="flex-1 h-full p-2 bg-zinc-950/40 overflow-hidden">
            <PreviewFrame htmlContent={previewContent} />
          </div>
        )}
      </div>
    </div>
  )
}
