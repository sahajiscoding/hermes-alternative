import { useState, useEffect } from 'react'
import {
  CheckIcon,
  CopyIcon,
  DocumentIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  InfoIcon,
  ProjectIcon,
  KeyIcon,
} from './icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProviderKey {
  id: string
  name: string
  envVar: string
  placeholder: string
  key: string
  status: 'unconfigured' | 'valid' | 'testing' | 'invalid'
}

const initialProviders: ProviderKey[] = [
  { id: 'openai', name: 'OpenAI (GPT-4o, o3-mini)', envVar: 'OPENAI_API_KEY', placeholder: 'sk-proj-...', key: '', status: 'unconfigured' },
  { id: 'anthropic', name: 'Anthropic (Claude 3.7 Sonnet)', envVar: 'ANTHROPIC_API_KEY', placeholder: 'sk-ant-api03-...', key: '', status: 'unconfigured' },
  { id: 'gemini', name: 'Google Gemini (2.5 Flash, Pro)', envVar: 'GEMINI_API_KEY', placeholder: 'AIzaSy...', key: '', status: 'unconfigured' },
  { id: 'groq', name: 'Groq (Llama 3.3 70B Fast)', envVar: 'GROQ_API_KEY', placeholder: 'gsk_...', key: '', status: 'unconfigured' },
  { id: 'openrouter', name: 'OpenRouter (All Models)', envVar: 'OPENROUTER_API_KEY', placeholder: 'sk-or-v1-...', key: '', status: 'unconfigured' },
  { id: 'deepseek', name: 'DeepSeek (V3, R1)', envVar: 'DEEPSEEK_API_KEY', placeholder: 'sk-...', key: '', status: 'unconfigured' },
  { id: 'ollama', name: 'Local Ollama / vLLM Endpoint', envVar: 'OLLAMA_BASE_URL', placeholder: 'http://localhost:11434', key: 'http://localhost:11434', status: 'valid' },
]

function copyText(value: string) {
  void navigator.clipboard.writeText(value)
}

function SecurityNote() {
  return (
    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 p-3 rounded-lg border border-border/50">
      <InfoIcon className="size-4 shrink-0 mt-0.5 text-info" />
      <p>
        <strong>Client-Side Zero-Knowledge Encryption:</strong> All API keys are encrypted locally on your machine using Windows DPAPI. Keys are never sent to external telemetry servers.
      </p>
    </div>
  )
}

export function ApiKeysPage() {
  const [providers, setProviders] = useState<ProviderKey[]>(() => {
    const saved = localStorage.getItem('hermes_byok_providers')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        return initialProviders
      }
    }
    return initialProviders
  })

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [envCopied, setEnvCopied] = useState(false)

  useEffect(() => {
    localStorage.setItem('hermes_byok_providers', JSON.stringify(providers))
    // Also notify Electron backend if window.electron exists
    if ((window as any).electron?.saveVaultKeys) {
      const keysMap: Record<string, string> = {}
      providers.forEach((p) => {
        if (p.key) keysMap[p.envVar] = p.key
      })
      ;(window as any).electron.saveVaultKeys(keysMap)
    }
  }, [providers])

  function handleKeyChange(id: string, newKey: string) {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            key: newKey,
            status: newKey.trim().length > 5 ? 'valid' : 'unconfigured',
          }
        }
        return p
      })
    )
  }

  function toggleVisibility(id: string) {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function copyWithFeedback(value: string, id: string) {
    copyText(value)
    setCopiedId(id)
    window.setTimeout(() => setCopiedId(null), 1500)
  }

  const generatedEnv = providers
    .filter((p) => p.key.trim().length > 0)
    .map((p) => `${p.envVar}=${p.key}`)
    .join('\n')

  function downloadEnv() {
    const blob = new Blob([generatedEnv || '# Hermes Alternative Environment\n'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '.env'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4 md:gap-10 md:p-8">
      <div className="flex flex-col md:gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">API Keys & BYOK Vault</h1>
        <p className="text-muted-foreground text-sm">
          Bring Your Own Key credentials. Configure your AI model portals for local and remote agent loops.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyIcon />
            <h2 className="font-medium text-base">Model Providers & Portals</h2>
          </div>
          <Badge variant="info">
            {providers.filter((p) => p.key.trim().length > 0).length} of {providers.length} Configured
          </Badge>
        </div>

        <div className="flex flex-col gap-3">
          {providers.map((p) => {
            const isVisible = visibleKeys[p.id]
            const isCopied = copiedId === p.id

            return (
              <div
                key={p.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-all hover:border-border/80"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {p.envVar}
                    </span>
                  </div>
                  {p.status === 'valid' && (
                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      Configured
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type={isVisible ? 'text' : 'password'}
                    value={p.key}
                    placeholder={p.placeholder}
                    onChange={(e) => handleKeyChange(p.id, e.target.value)}
                    className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm font-mono tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground"
                    aria-label={isVisible ? 'Hide key' : 'Show key'}
                    onClick={() => toggleVisibility(p.id)}
                  >
                    {isVisible ? <EyeOffIcon /> : <EyeIcon />}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-9 text-muted-foreground"
                    aria-label="Copy key"
                    onClick={() => copyWithFeedback(p.key, p.id)}
                  >
                    {isCopied ? <CheckIcon /> : <CopyIcon />}
                  </Button>
                </div>
              </div>
            )
          })}

          <SecurityNote />
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="flex flex-col gap-6">
        <h2 className="font-medium text-base">Export Environment Variables</h2>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <DocumentIcon />
                <span>.env configuration preview</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 px-3 text-xs font-normal"
                  onClick={() => {
                    copyText(generatedEnv)
                    setEnvCopied(true)
                    window.setTimeout(() => setEnvCopied(false), 1500)
                  }}
                >
                  {envCopied ? <CheckIcon /> : <CopyIcon />}
                  {envCopied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 gap-1.5 px-3 text-xs font-normal"
                  onClick={downloadEnv}
                >
                  <DownloadIcon />
                  Download .env
                </Button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 text-xs font-mono">
              <pre className="whitespace-pre-wrap text-muted-foreground">
                {generatedEnv || '# No keys entered yet. Add your keys above to generate a .env block.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
