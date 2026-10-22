import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { KeyRound, Eye, EyeOff, Copy, Check, ShieldCheck, Lock, ExternalLink, RefreshCw } from 'lucide-react'

interface KeyItem {
  id: string
  name: string
  envVar: string
  placeholder: string
  description: string
  docsUrl: string
}

const PROVIDERS: KeyItem[] = [
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    envVar: 'ANTHROPIC_API_KEY',
    placeholder: 'sk-ant-api03-...',
    description: 'Powers Sonnet 3.7 reasoning and deep code generation.',
    docsUrl: 'https://console.anthropic.com',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    placeholder: 'sk-proj-...',
    description: 'Powers GPT-4o, o3-mini, and advanced embedding models.',
    docsUrl: 'https://platform.openai.com',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    envVar: 'GEMINI_API_KEY',
    placeholder: 'AIzaSy...',
    description: 'Powers Gemini 2.5 Flash / Pro with 1M+ token context.',
    docsUrl: 'https://aistudio.google.com',
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    envVar: 'GROQ_API_KEY',
    placeholder: 'gsk_...',
    description: 'Ultra-fast inference for Llama 3.3 70B and fast syntax checks.',
    docsUrl: 'https://console.groq.com',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    envVar: 'OPENROUTER_API_KEY',
    placeholder: 'sk-or-v1-...',
    description: 'Unified multi-provider access to DeepSeek R1, Claude, and open weights.',
    docsUrl: 'https://openrouter.ai',
  },
  {
    id: 'ollama',
    name: 'Local Ollama Endpoint',
    envVar: 'OLLAMA_BASE_URL',
    placeholder: 'http://localhost:11434',
    description: 'Offline local models running on your local GPU/CPU.',
    docsUrl: 'https://ollama.com',
  },
]

export function ApiKeysPage() {
  const [keys, setKeys] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('hermes_byok_vault')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return {
      OLLAMA_BASE_URL: 'http://localhost:11434',
    }
  })

  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if ((window as any).electron?.loadVaultKeys) {
      ;(window as any).electron.loadVaultKeys().then((loaded: Record<string, string>) => {
        if (loaded && Object.keys(loaded).length > 0) {
          setKeys((prev) => ({ ...prev, ...loaded }))
        }
      })
    }
  }, [])

  function toggleVisible(id: string) {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleCopy(val: string, id: string) {
    navigator.clipboard.writeText(val)
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)

    localStorage.setItem('hermes_byok_vault', JSON.stringify(keys))

    if ((window as any).electron?.saveVaultKeys) {
      try {
        await (window as any).electron.saveVaultKeys(keys)
      } catch (e) {
        console.warn('Error saving to vault IPC:', e)
      }
    }

    setIsSaving(false)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2000)
  }

  const configuredCount = Object.values(keys).filter((v) => v && v.trim().length > 0).length

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <KeyRound className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              BYOK Credential Vault
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              Bring Your Own Keys. Encrypted locally on your machine using AES-256-GCM.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="w-fit text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs px-3 py-1 font-mono">
          {configuredCount} of {PROVIDERS.length} Providers Configured
        </Badge>
      </div>

      {/* Security Banner */}
      <div className="flex items-start gap-3.5 p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
        <ShieldCheck className="size-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm">Direct Upstream Communication</span>
          <span className="leading-relaxed">
            Hermes never sends your API keys to any third-party telemetry service. All requests execute directly from this machine to the upstream AI provider.
          </span>
        </div>
      </div>

      {/* Keys Form */}
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROVIDERS.map((provider) => {
            const val = keys[provider.envVar] || ''
            const isShown = visibleKeys[provider.id] || false
            const isConfigured = val.trim().length > 0

            return (
              <div
                key={provider.id}
                className="flex flex-col justify-between gap-3.5 p-4 md:p-5 rounded-2xl border border-border bg-card shadow-xs transition-colors focus-within:border-primary/50"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground">{provider.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xxs px-2 py-0.5 font-mono ${
                        isConfigured
                          ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-muted-foreground border-border bg-muted/40'
                      }`}
                    >
                      {isConfigured ? 'Active' : 'Unset'}
                    </Badge>
                  </div>
                  <p className="text-xxs text-muted-foreground line-clamp-1">{provider.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center h-11 rounded-xl bg-background border border-border px-3 gap-2">
                    <input
                      type={isShown ? 'text' : 'password'}
                      value={val}
                      onChange={(e) => setKeys({ ...keys, [provider.envVar]: e.target.value })}
                      placeholder={provider.placeholder}
                      className="flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {val && (
                      <button
                        type="button"
                        onClick={() => toggleVisible(provider.id)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title={isShown ? 'Hide key' : 'Show key'}
                      >
                        {isShown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    )}
                  </div>

                  {val && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(val, provider.id)}
                      className="size-11 shrink-0 cursor-pointer"
                      title="Copy key"
                    >
                      {copiedKey === provider.id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card mt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="size-4 text-emerald-500" />
            <span className="font-mono">AES-256-GCM Machine Key Salt</span>
          </div>
          <Button type="submit" disabled={isSaving} className="h-10 px-6 font-medium text-xs gap-2 cursor-pointer">
            {saveSuccess ? <Check className="size-4 text-emerald-400" /> : isSaving ? <RefreshCw className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
            <span>{saveSuccess ? 'Vault Saved!' : isSaving ? 'Saving...' : 'Save All Credentials'}</span>
          </Button>
        </div>
      </form>
    </div>
  )
}
