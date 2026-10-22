import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Terminal, Send, Play, Square, CheckCircle, AlertTriangle, Sparkles, Flame, Eye, RefreshCw } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  content: string
  toolCalls?: Array<{
    name: string
    args: any
    status: 'running' | 'done' | 'failed'
    output?: string
  }>
  timestamp: string
}

export function TerminalView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Hermes Agent Core initialized. System tools ready (terminal execution, file read/write, git, AST symbols). Select an execution mode and enter your coding task.',
      timestamp: new Date().toLocaleTimeString(),
    },
  ])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('claude-3-7-sonnet')
  const [agentMode, setAgentMode] = useState<'standard' | 'larp' | '67' | 'crash-out'>('larp')
  const [isRunning, setIsRunning] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!input.trim() || isRunning) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    }

    setMessages((prev) => [...prev, userMsg])
    const promptText = input
    setInput('')
    setIsRunning(true)

    // Simulate multi-turn agent execution with streaming tools
    setTimeout(() => {
      let assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Running in [${agentMode.toUpperCase()}] mode using model \`${selectedModel}\`.\nAnalyzing workspace files and planning implementation...`,
        toolCalls: [
          {
            name: 'list_dir',
            args: { path: '.' },
            status: 'running',
          },
        ],
        timestamp: new Date().toLocaleTimeString(),
      }
      setMessages((prev) => [...prev, assistantMsg])

      setTimeout(() => {
        assistantMsg.toolCalls![0].status = 'done'
        assistantMsg.toolCalls![0].output = 'src/ package.json tsconfig.json vite.config.ts docs/'

        assistantMsg.toolCalls!.push({
          name: 'run_command',
          args: { command: 'git status' },
          status: 'running',
        })
        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMsg }])

        setTimeout(() => {
          assistantMsg.toolCalls![1].status = 'done'
          assistantMsg.toolCalls![1].output = 'On branch main\nChanges staged for commit.'
          assistantMsg.content += '\n\nDone! All verification checks passed and code structure conforms to the anti-slop guidelines.'
          setIsRunning(false)
          setMessages((prev) => [...prev.slice(0, -1), { ...assistantMsg }])
        }, 1200)
      }, 1000)
    }, 600)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-6 gap-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="size-5 text-primary" />
          <h1 className="text-lg font-semibold tracking-tight">Interactive Agent Loop</h1>
          <Badge variant="outline" className="text-xxs">
            {isRunning ? 'AGENT BUSY' : 'STANDBY'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Selector */}
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5 text-xs">
            <button
              onClick={() => setAgentMode('larp')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                agentMode === 'larp' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Eye className="inline size-3 mr-1" />
              larp (Anti-Slop)
            </button>
            <button
              onClick={() => setAgentMode('67')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                agentMode === '67' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="inline size-3 mr-1" />
              67 (Tournament)
            </button>
            <button
              onClick={() => setAgentMode('crash-out')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                agentMode === 'crash-out' ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Flame className="inline size-3 mr-1" />
              crash-out (Adversary)
            </button>
          </div>

          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-mono text-foreground focus-visible:outline-none"
          >
            <option value="claude-3-7-sonnet">Claude 3.7 Sonnet</option>
            <option value="gpt-4o">OpenAI GPT-4o</option>
            <option value="gemini-2-5-pro">Google Gemini 2.5 Pro</option>
            <option value="llama-3-3-70b-groq">Groq Llama 3.3 70B</option>
            <option value="deepseek-r1">DeepSeek R1</option>
            <option value="ollama-local">Local Ollama</option>
          </select>
        </div>
      </div>

      {/* Terminal Output Log Area */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4 space-y-4 font-sans text-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-1.5 p-3.5 rounded-lg border ${
              m.role === 'user'
                ? 'bg-secondary/60 border-border text-foreground ml-8'
                : m.role === 'system'
                ? 'bg-muted/40 border-border/50 text-muted-foreground text-xs font-mono'
                : 'bg-card border-border text-foreground mr-8'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-semibold uppercase tracking-wider text-xxs">
                {m.role === 'user' ? 'You' : m.role === 'system' ? 'System' : 'Hermes Agent'}
              </span>
              <span>{m.timestamp}</span>
            </div>

            <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>

            {/* Tool Calls Execution Cards */}
            {m.toolCalls && m.toolCalls.length > 0 && (
              <div className="mt-2 space-y-2">
                {m.toolCalls.map((t, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-border/60 bg-background/80 p-2.5 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Terminal className="size-3.5 text-muted-foreground" />
                        <span className="font-semibold text-foreground">{t.name}</span>
                        <span className="text-muted-foreground">{JSON.stringify(t.args)}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          t.status === 'running'
                            ? 'text-amber-500 border-amber-500/20 animate-pulse'
                            : 'text-emerald-500 border-emerald-500/20'
                        }
                      >
                        {t.status}
                      </Badge>
                    </div>
                    {t.output && (
                      <pre className="mt-2 pt-2 border-t border-border/40 text-muted-foreground overflow-x-auto whitespace-pre">
                        {t.output}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          disabled={isRunning}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={
            agentMode === 'larp'
              ? 'Instruct agent with anti-slop design mode active...'
              : agentMode === '67'
              ? 'Pose task for 6-agent competitive tournament...'
              : 'Enter code or task for adversarial crash-out testing...'
          }
          className="flex-1 h-11 rounded-xl border border-border bg-card px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isRunning}
          className="h-11 px-5 gap-2 font-medium"
        >
          {isRunning ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
          <span>Execute</span>
        </Button>
      </div>
    </div>
  )
}
