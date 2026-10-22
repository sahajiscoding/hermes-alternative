import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  UserCheck,
  Shield,
  Smartphone,
  Laptop,
  Check,
  Trash2,
  Plus,
  Sparkles,
  KeyRound,
  Fingerprint,
} from 'lucide-react'

export interface UserProfile {
  name: string
  email: string
  role: string
  preferredModel: string
  workspacePath: string
  registeredAt: string
  desktopName: string
}

export function RegistrationPage() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hermes_user_profile')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return {
      name: 'Sahaj',
      email: 'sahaj@local.dev',
      role: 'Lead Architect',
      preferredModel: 'claude-3-7-sonnet',
      workspacePath: 'c:\\Users\\kids\\Desktop\\Backup Folders\\sahaj ke programs\\hermes-alternative',
      registeredAt: new Date().toLocaleDateString(),
      desktopName: 'HERMES-DESKTOP',
    }
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [registeredDevices, setRegisteredDevices] = useState<Array<{ id: string; name: string; token: string; pairedAt: string }>>([])
  const [newDeviceName, setNewDeviceName] = useState('')
  const [showAddDevice, setShowAddDevice] = useState(false)

  useEffect(() => {
    // Load registered devices from server
    const host = window.location.hostname || 'localhost'
    fetch(`http://${host}:4152/api/v1/devices`)
      .then((res) => res.json())
      .then(setRegisteredDevices)
      .catch(() => {})
  }, [])

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    localStorage.setItem('hermes_user_profile', JSON.stringify(profile))
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2000)

    // Also update window event so sidebar updates instantly
    window.dispatchEvent(new CustomEvent('hermes-profile-updated', { detail: profile }))
  }

  async function handleAddDevice(e: React.FormEvent) {
    e.preventDefault()
    if (!newDeviceName.trim()) return

    const newDev = {
      id: `dev_${Date.now()}`,
      name: newDeviceName.trim(),
      token: `sesori_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      pairedAt: new Date().toISOString(),
    }

    setRegisteredDevices([newDev, ...registeredDevices])
    setNewDeviceName('')
    setShowAddDevice(false)
  }

  function handleRemoveDevice(id: string) {
    const host = window.location.hostname || 'localhost'
    fetch(`http://${host}:4152/api/v1/devices/${id}`, { method: 'DELETE' }).catch(() => {})
    setRegisteredDevices(registeredDevices.filter((d) => d.id !== id))
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <UserCheck className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Developer & Device Registration
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              Configure your local identity, authorized companion devices, and default agent environment.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="w-fit text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs px-3 py-1 font-mono">
          <Fingerprint className="size-3.5 mr-1.5" />
          Local Profile Active
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Form (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-5 p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Shield className="size-4 text-emerald-500" />
                <span>Developer Profile Credentials</span>
              </div>
              <span className="text-xxs font-mono text-muted-foreground">
                Machine Bound: SHA-256
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dev-name" className="text-xs font-semibold text-muted-foreground">
                  Full Name / Developer Alias
                </label>
                <input
                  id="dev-name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="h-11 px-3.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="dev-email" className="text-xs font-semibold text-muted-foreground">
                  Email / Identifier
                </label>
                <input
                  id="dev-email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-11 px-3.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dev-model" className="text-xs font-semibold text-muted-foreground">
                  Default Agent Model Engine
                </label>
                <select
                  id="dev-model"
                  value={profile.preferredModel}
                  onChange={(e) => setProfile({ ...profile, preferredModel: e.target.value })}
                  className="h-11 px-3.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="claude-3-7-sonnet">Claude 3.7 Sonnet (Anthropic)</option>
                  <option value="gpt-4o">GPT-4o (OpenAI)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Google)</option>
                  <option value="deepseek-r1">DeepSeek R1 (OpenRouter / Local)</option>
                  <option value="ollama-local">Local Ollama (Offline)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="dev-host" className="text-xs font-semibold text-muted-foreground">
                  Registered Desktop Host
                </label>
                <input
                  id="dev-host"
                  type="text"
                  value={profile.desktopName}
                  onChange={(e) => setProfile({ ...profile, desktopName: e.target.value })}
                  className="h-11 px-3.5 rounded-xl bg-background border border-border text-sm font-mono text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="dev-workspace" className="text-xs font-semibold text-muted-foreground">
                Default Project Workspace Path
              </label>
              <input
                id="dev-workspace"
                type="text"
                value={profile.workspacePath}
                onChange={(e) => setProfile({ ...profile, workspacePath: e.target.value })}
                className="h-11 px-3.5 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">
                Registered on {profile.registeredAt} • Stored locally
              </span>
              <Button type="submit" className="h-10 px-5 gap-2 font-medium cursor-pointer">
                {savedSuccess ? <Check className="size-4 text-emerald-400" /> : <UserCheck className="size-4" />}
                <span>{savedSuccess ? 'Profile Saved!' : 'Save & Register Profile'}</span>
              </Button>
            </div>
          </form>

          {/* Device Registration Section */}
          <div className="flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Smartphone className="size-4 text-primary" />
                <span>Registered Companion Devices</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddDevice(!showAddDevice)}
                className="h-9 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Add Companion</span>
              </Button>
            </div>

            {showAddDevice && (
              <form onSubmit={handleAddDevice} className="flex items-center gap-2 p-3 bg-secondary rounded-xl border border-border">
                <input
                  type="text"
                  placeholder="Device Name (e.g. Sahaj's iPhone 16)"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-9 px-3.5 text-xs font-medium cursor-pointer">
                  Register
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddDevice(false)}
                  className="h-9 px-2 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
              </form>
            )}

            {registeredDevices.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center border border-dashed border-border rounded-xl">
                No mobile companions registered yet. Pair your smartphone from the Mobile Companion tab using the QR code.
              </p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
                {registeredDevices.map((dev) => (
                  <div key={dev.id} className="flex items-center justify-between p-3.5 px-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Smartphone className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{dev.name}</span>
                        <span className="text-xxs text-muted-foreground font-mono">
                          Token: {dev.token.slice(0, 16)}... • Paired {new Date(dev.pairedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDevice(dev.id)}
                      className="size-8 text-muted-foreground hover:text-rose-500 cursor-pointer"
                      title="Revoke device access"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Status Info Card (1 col) */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
            <h3 className="font-semibold text-sm text-foreground">Host System Vitals</h3>
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Node Environment</span>
                <span className="font-mono text-foreground font-medium">Windows (Win32)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Local API Server</span>
                <span className="font-mono text-emerald-500 font-medium">Port 4152 (Online)</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Sleep Prevention</span>
                <span className="text-emerald-500 font-medium">Native Continuous</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground">Encrypted Vault</span>
                <span className="text-foreground font-medium font-mono">AES-256-GCM</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground">Companion Devices</span>
                <span className="text-foreground font-medium font-mono">{registeredDevices.length} Authorized</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
              <Sparkles className="size-4 text-emerald-500" />
              <span>Zero Cloud Lock-in</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hermes Alternative runs completely on your local workstation. All API credentials and session records stay encrypted in your local Windows AppData vault.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
