import { useState, useRef, useEffect } from 'react'
import { RotateCw, Monitor, Tablet, Smartphone, ExternalLink, Code2, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PreviewFrameProps {
  htmlContent: string
}

export function PreviewFrame({ htmlContent }: PreviewFrameProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [reloadKey, setReloadKey] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px] border-x border-border',
    mobile: 'w-[375px] border-x border-border',
  }[device]

  function handleReload() {
    setReloadKey((prev) => prev + 1)
  }

  function handleOpenExternal() {
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 border border-border rounded-xl overflow-hidden shadow-xs">
      {/* Top Preview Control Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-tight text-foreground">Live App Preview</span>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center rounded-lg border border-border bg-background p-0.5">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-1 rounded-md transition-colors ${
              device === 'desktop' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Desktop View"
          >
            <Monitor className="size-3.5" />
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`p-1 rounded-md transition-colors ${
              device === 'tablet' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Tablet View"
          >
            <Tablet className="size-3.5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-1 rounded-md transition-colors ${
              device === 'mobile' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Mobile View"
          >
            <Smartphone className="size-3.5" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReload}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Reload Frame"
          >
            <RotateCw className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenExternal}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Open in New Tab"
          >
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Sandboxed iframe */}
      <div className="flex-1 overflow-auto flex justify-center bg-zinc-900/50 p-2">
        <div className={`h-full ${deviceWidths} transition-all duration-300 rounded-lg overflow-hidden bg-white shadow-2xl`}>
          <iframe
            key={reloadKey}
            ref={iframeRef}
            srcDoc={htmlContent}
            title="Application Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-none"
          />
        </div>
      </div>
    </div>
  )
}
