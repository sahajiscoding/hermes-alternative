import { useState, useEffect } from 'react'
import { Copy, Check, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CodeEditorProps {
  filename: string
  content: string
  onChange: (newContent: string) => void
}

export function CodeEditor({ filename, content, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const lineCount = content.split('\n').length

  function handleCopy() {
    void navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col h-full flex-1 bg-zinc-950 border-r border-border overflow-hidden">
      {/* Editor Header Tab Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-secondary text-xs font-mono font-medium text-foreground">
            <FileCode className="size-3.5 text-primary" />
            <span>{filename}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 gap-1 px-2 text-xxs text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
          <span>{copied ? 'Copied' : 'Copy Code'}</span>
        </Button>
      </div>

      {/* Editor Area with Line Numbers */}
      <div className="flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers */}
        <div className="w-12 py-3 px-2 text-right bg-zinc-900/40 text-zinc-600 select-none border-r border-zinc-800/60 overflow-hidden">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="leading-5 h-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 p-3 bg-transparent text-zinc-200 resize-none outline-none leading-5 font-mono overflow-auto whitespace-pre tab-4 border-none focus:ring-0"
        />
      </div>
    </div>
  )
}
