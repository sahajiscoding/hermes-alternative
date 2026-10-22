import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Eye, Flame, Zap, RefreshCw, Bot, User, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode?: string
  diffInfo?: string
  timestamp: string
}

interface ChatPanelProps {
  onGenerateCode: (prompt: string, mode: string) => void
  isGenerating: boolean
}

export function ChatPanel({ onGenerateCode, isGenerating }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to Hermes Web Studio! Describe any web app, component, or feature, and I will generate and preview it in real-time.',
      timestamp: 'Just now',
    },
  ])
  const [prompt, setPrompt] = useState('')
  const [activeMode, setActiveMode] = useState<'larp' | '67' | 'crash-out'>('larp')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend(text?: string) {
    const query = text || prompt
    if (!query.trim() || isGenerating) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!text) setPrompt('')

    // Trigger parent code generation
    onGenerateCode(query, activeMode)

    // Add assistant placeholder response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Updating application using [${activeMode.toUpperCase()}] engine directives. Files updated: index.html. Preview refreshed!`,
          mode: activeMode,
          diffInfo: '+ Added interactive features & Apple fluid motion styling.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }, 1200)
  }

  const quickPrompts = [
    'Add interactive pricing calculator',
    'Add animated testimonials carousel',
    'Make hero button spring on press',
    'Run crash-out security audit',
  ]

  return (
    <div className="flex flex-col h-full w-80 md:w-96 border-r border-border bg-card/80 backdrop-blur-md">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bot className="size-4 text-primary" />
          <span className="font-semibold text-sm">Agent Copilot</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveMode('larp')}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              activeMode === 'larp' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Anti-Slop Mode (larp)"
          >
            <Eye className="size-3.5" />
          </button>
          <button
            onClick={() => setActiveMode('67')}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              activeMode === '67' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Six-Agent Tournament (67)"
          >
            <Zap className="size-3.5" />
          </button>
          <button
            onClick={() => setActiveMode('crash-out')}
            className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
              activeMode === 'crash-out' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Crash-Out Auditor"
          >
            <Flame className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Message stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-1.5 p-3 rounded-xl border ${
              m.role === 'user'
                ? 'bg-secondary/70 border-border text-foreground ml-4'
                : 'bg-background border-border text-foreground mr-4 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between text-xxs text-muted-foreground">
              <span className="font-bold uppercase tracking-wider">{m.role === 'user' ? 'You' : 'Hermes Agent'}</span>
              <span>{m.timestamp}</span>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
            {m.diffInfo && (
              <div className="mt-1 p-2 rounded-md bg-muted/50 border border-border/40 font-mono text-xxs text-emerald-500">
                {m.diffInfo}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Suggestions */}
      <div className="px-3 py-2 border-t border-border/60 flex flex-wrap gap-1.5">
        {quickPrompts.map((qp) => (
          <button
            key={qp}
            onClick={() => handleSend(qp)}
            className="px-2 py-1 rounded-md border border-border bg-background/60 hover:bg-accent text-xxs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Prompt Input Form */}
      <div className="p-3 border-t border-border flex items-center gap-2 bg-card">
        <input
          type="text"
          value={prompt}
          disabled={isGenerating}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`Instruct agent with ${activeMode.toUpperCase()} active...`}
          className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          size="icon"
          onClick={() => handleSend()}
          disabled={!prompt.trim() || isGenerating}
          className="size-10 shrink-0"
        >
          {isGenerating ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
