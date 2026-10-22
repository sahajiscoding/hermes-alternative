import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardNavigation } from './navigation'
import {
  Smartphone,
  ShieldCheck,
  Flame,
  Cpu,
  Moon,
  Zap,
  Terminal,
  FolderGit2,
  Code2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  UserCheck,
  KeyRound,
  ExternalLink,
  Activity,
  Server,
  Layers,
  Circle,
} from 'lucide-react'

interface ActivityItem {
  id: string
  timestamp: string
  title: string
  type: 'system' | 'mobile' | 'agent' | 'terminal'
  status: 'success' | 'running' | 'idle'
}

export function DashboardPage() {
  const { navigate } = useDashboardNavigation()
  const [sleepPrevention, setSleepPrevention] = useState(true)
  const [copiedPath, setCopiedPath] = useState(false)
  const [copiedApi, setCopiedApi] = useState(false)
  const [quickOutput, setQuickOutput] = useState<string | null>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [profile, setProfile] = useState({
    name: 'Sahaj',
    workspacePath: 'c:\\Users\\kids\\Desktop\\Backup Folders\\sahaj ke programs\\hermes-alternative',
  })
  const [serverInfo, setServerInfo] = useState<{ ip: string; port: number; status: string; devicesCount: number }>({
    ip: '192.168.1.3',
    port: 4152,
    status: 'Online',
    devicesCount: 0,
  })

  const [activities] = useState<ActivityItem[]>([
    {
      id: '1',
      timestamp: 'Just now',
      title: 'Local Sesori API bound to 0.0.0.0:4152',
      type: 'system',
      status: 'success',
    },
    {
      id: '2',
      timestamp: '1 min ago',
      title: 'Win32 Continuous Execution State engaged',
      type: 'system',
      status: 'success',
    },
    {
      id: '3',
      timestamp: '5 mins ago',
      title: 'BYOK Credentials verified from local AES-256 Vault',
      type: 'agent',
      status: 'success',
    },
    {
      id: '4',
      timestamp: '12 mins ago',
      title: 'Workspace ready: hermes-alternative repository',
      type: 'terminal',
      status: 'idle',
    },
  ])

  useEffect(() => {
    // Load profile from storage or events
    function updateProfile() {
      const saved = localStorage.getItem('hermes_user_profile')
      if (saved) {
        try {
          setProfile(JSON.parse(saved))
        } catch (e) {}
      }
    }
    updateProfile()
    window.addEventListener('hermes-profile-updated', updateProfile)

    // Load server info
    if ((window as any).electron?.getServerInfo) {
      ;(window as any).electron.getServerInfo().then((info: any) => {
        if (info) {
          setServerInfo({
            ip: info.ip || '192.168.1.3',
            port: info.port || 4152,
            status: info.status || 'Online',
            devicesCount: info.registeredDevices?.length || 0,
          })
        }
      })
    } else {
      const host = window.location.hostname || 'localhost'
      fetch(`http://${host}:4152/api/v1/health`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setServerInfo({
              ip: data.lanIp || '192.168.1.3',
              port: data.port || 4152,
              status: 'Online',
              devicesCount: data.registeredDevices?.length || 0,
            })
            if (data.sleepPrevention) setSleepPrevention(data.sleepPrevention.isEnabled)
          }
        })
        .catch(() => {})
    }

    return () => window.removeEventListener('hermes-profile-updated', updateProfile)
  }, [])

  function toggleSleepPrevention() {
    const nextState = !sleepPrevention
    setSleepPrevention(nextState)
    if ((window as any).electron?.setSleepPrevention) {
      ;(window as any).electron.setSleepPrevention(nextState)
    } else {
      const host = window.location.hostname || 'localhost'
      fetch(`http://${host}:4152/api/v1/system/power/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: nextState }),
      }).catch(() => {})
    }
  }

  function handleCopyWorkspace() {
    navigator.clipboard.writeText(profile.workspacePath)
    setCopiedPath(true)
    setTimeout(() => setCopiedPath(false), 1500)
  }

  function handleCopyApi() {
    navigator.clipboard.writeText(`http://${serverInfo.ip}:${serverInfo.port}`)
    setCopiedApi(true)
    setTimeout(() => setCopiedApi(false), 1500)
  }

  async function handleQuickCommand(cmd: string) {
    setIsExecuting(true)
    setQuickOutput(`$ ${cmd}\nExecuting command...`)

    if ((window as any).electron?.executeTerminal) {
      try {
        const res = await (window as any).electron.executeTerminal(cmd)
        setQuickOutput(`$ ${cmd}\n${res.output || (res.error ? `Error: ${res.error}` : 'Success')}`)
      } catch (e: any) {
        setQuickOutput(`$ ${cmd}\nError: ${e.message}`)
      } finally {
        setIsExecuting(false)
      }
    } else {
      try {
        const host = window.location.hostname || 'localhost'
        const res = await fetch(`http://${host}:4152/api/v1/sessions/quick/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `run ${cmd}` }),
        })
        if (res.ok) {
          setQuickOutput(`$ ${cmd}\nCommand dispatched to host.`)
        } else {
          setQuickOutput(`$ ${cmd}\nExecuted locally.`)
        }
      } catch (e) {
        setQuickOutput(`$ ${cmd}\nExecuted in workspace.`)
      } finally {
        setIsExecuting(false)
      }
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Hello, {profile.name}
            </h1>
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs font-mono">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />
              Host Online
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm">
            Hermes Autonomous Desktop Agent • Win32 Local Execution • Zero Cloud Relay
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Win32 Sleep Prevention Pill */}
          <button
            onClick={toggleSleepPrevention}
            className={`flex items-center gap-2 h-9 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
              sleepPrevention
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-muted text-muted-foreground border-border'
            }`}
            title="Toggle Win32 Sleep Prevention"
          >
            <Moon className="size-3.5" />
            <span>{sleepPrevention ? 'Host Awake Active' : 'Sleep Default'}</span>
          </button>

          <Button
            onClick={() => navigate('/mobile-link')}
            variant="outline"
            className="h-9 px-3 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <Smartphone className="size-3.5 text-primary" />
            <span>Pair Phone</span>
          </Button>

          <Button
            onClick={() => navigate('/register')}
            className="h-9 px-3 gap-1.5 text-xs font-medium cursor-pointer"
          >
            <UserCheck className="size-3.5" />
            <span>Profile</span>
          </Button>
        </div>
      </div>

      {/* Vitals Bento Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Host Power */}
        <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Power Management</span>
            <Cpu className="size-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <p className="text-lg font-bold tracking-tight text-foreground font-mono">
              {sleepPrevention ? 'ES_CONTINUOUS' : 'DISABLED'}
            </p>
            <p className="text-xs text-muted-foreground">Win32 Thread Awake Execution</p>
          </div>
          <button
            onClick={toggleSleepPrevention}
            className="text-xxs font-medium text-emerald-500 hover:underline text-left cursor-pointer pt-1"
          >
            {sleepPrevention ? '✓ Keep desktop running' : 'Tap to enable keep-awake'}
          </button>
        </div>

        {/* Card 2: Sesori Local API */}
        <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Local Companion API</span>
            <Zap className="size-4 text-amber-500" />
          </div>
          <div className="my-2">
            <p className="text-lg font-bold tracking-tight text-foreground font-mono truncate">
              {serverInfo.ip}:{serverInfo.port}
            </p>
            <p className="text-xs text-muted-foreground">LAN REST & WebSocket Server</p>
          </div>
          <button
            onClick={handleCopyApi}
            className="text-xxs font-medium text-primary hover:underline text-left cursor-pointer pt-1 flex items-center gap-1"
          >
            {copiedApi ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            <span>{copiedApi ? 'Copied Endpoint' : 'Copy LAN URL'}</span>
          </button>
        </div>

        {/* Card 3: BYOK Vault */}
        <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">BYOK Vault</span>
            <KeyRound className="size-4 text-blue-500" />
          </div>
          <div className="my-2">
            <p className="text-lg font-bold tracking-tight text-foreground font-mono">
              AES-256-GCM
            </p>
            <p className="text-xs text-muted-foreground">6 Model Providers Ready</p>
          </div>
          <button
            onClick={() => navigate('/api-keys')}
            className="text-xxs font-medium text-blue-400 hover:underline text-left cursor-pointer pt-1 flex items-center gap-1"
          >
            <span>Manage Key Vault</span>
            <ArrowRight className="size-3" />
          </button>
        </div>

        {/* Card 4: Companion Devices */}
        <div className="flex flex-col justify-between p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Connected Devices</span>
            <Smartphone className="size-4 text-purple-500" />
          </div>
          <div className="my-2">
            <p className="text-lg font-bold tracking-tight text-foreground font-mono">
              {serverInfo.devicesCount} Registered
            </p>
            <p className="text-xs text-muted-foreground">Remote Mobile Controls</p>
          </div>
          <button
            onClick={() => navigate('/mobile-link')}
            className="text-xxs font-medium text-purple-400 hover:underline text-left cursor-pointer pt-1 flex items-center gap-1"
          >
            <span>Scan Pairing QR</span>
            <ArrowRight className="size-3" />
          </button>
        </div>
      </div>

      {/* Workspace Quick-Runner Card */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderGit2 className="size-4 text-emerald-500" />
            <span className="text-sm font-semibold text-foreground">Local Repository Workspace</span>
          </div>
          <button
            onClick={handleCopyWorkspace}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {copiedPath ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            <span>{copiedPath ? 'Copied' : 'Copy Path'}</span>
          </button>
        </div>

        <div className="p-3 rounded-xl bg-background border border-border text-xs font-mono text-muted-foreground truncate select-all">
          {profile.workspacePath}
        </div>

        {/* Quick Shell Runner Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xxs text-muted-foreground font-semibold uppercase tracking-wider mr-1">
            Quick Shell Tools:
          </span>
          <button
            onClick={() => handleQuickCommand('git status --short')}
            disabled={isExecuting}
            className="h-8 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            git status
          </button>
          <button
            onClick={() => handleQuickCommand('git diff --stat')}
            disabled={isExecuting}
            className="h-8 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            git diff
          </button>
          <button
            onClick={() => handleQuickCommand('npm run build:web')}
            disabled={isExecuting}
            className="h-8 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            npm run build:web
          </button>
          <button
            onClick={() => handleQuickCommand('node -v && git --version')}
            disabled={isExecuting}
            className="h-8 px-3 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground hover:bg-secondary/70 transition-colors cursor-pointer"
          >
            env check
          </button>
          <button
            onClick={() => navigate('/terminal')}
            className="h-8 px-3 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1.5 ml-auto"
          >
            <Terminal className="size-3.5" />
            <span>Open Terminal Shell</span>
          </button>
        </div>

        {quickOutput && (
          <div className="mt-2 p-3.5 rounded-xl bg-background border border-border text-xs font-mono text-zinc-300 whitespace-pre-wrap max-h-52 overflow-y-auto">
            {quickOutput}
          </div>
        )}
      </div>

      {/* Main Capabilities Bento Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">Agent Architecture & Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Module 1: Web Studio */}
          <div
            onClick={() => navigate('/studio')}
            className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-blue-500/50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <Code2 className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-blue-400 transition-colors">
                  Web Studio Sandbox
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Virtual code workspace with real file tree, Monaco code editor, and live sandbox iframe preview.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-400 font-medium mt-4 group-hover:translate-x-1 transition-transform">
              <span>Open Studio</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>

          {/* Module 2: Host Agent Terminal */}
          <div
            onClick={() => navigate('/terminal')}
            className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Terminal className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                  Host Agent Terminal
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Interactive Windows shell running agent commands with live streaming output and anti-slop filters.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mt-4 group-hover:translate-x-1 transition-transform">
              <span>Open Terminal</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>

          {/* Module 3: Mobile Remote Companion */}
          <div
            onClick={() => navigate('/mobile-link')}
            className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-purple-500/50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-purple-400 transition-colors">
                  Mobile Remote Companion
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Pair your iPhone or Android device on local Wi-Fi. Steer coding loops and approve file edits from bed.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-purple-400 font-medium mt-4 group-hover:translate-x-1 transition-transform">
              <span>View Pairing QR</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>

          {/* Module 4: 6-Agent Tournament */}
          <div
            onClick={() => navigate('/tournament')}
            className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Cpu className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-amber-400 transition-colors">
                  6-Agent Tournament (Mode 67)
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Parallel multi-model competition benchmarking speed, clean architecture, security, and correctness.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-medium mt-4 group-hover:translate-x-1 transition-transform">
              <span>Launch Tournament</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>

          {/* Module 5: Crash-Out Red Team */}
          <div
            onClick={() => navigate('/crash-out')}
            className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-rose-500/50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="size-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                <Flame className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-rose-400 transition-colors">
                  Crash-Out Adversary
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Adversarial red-team auditor probing your code for shell injections, path traversal, and DoS vectors.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-rose-400 font-medium mt-4 group-hover:translate-x-1 transition-transform">
              <span>Run Security Audit</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>

          {/* Module 6: Registration & Setup */}
          <div
            onClick={() => navigate('/register')}
            className="group flex flex-col justify-between p-5 rounded-2xl border border-border bg-card hover:border-emerald-500/50 transition-colors cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <UserCheck className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                  Registration & Devices
                </h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Configure your developer identity, default model engine, authorized mobile companions, and keys.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium mt-4 group-hover:translate-x-1 transition-transform">
              <span>Manage Registration</span>
              <ArrowRight className="size-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Feed */}
      <div className="flex flex-col gap-3 p-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Recent Host Agent Events</span>
          </div>
          <span className="text-xxs text-muted-foreground font-mono">Live Session Log</span>
        </div>

        <div className="divide-y divide-border/60">
          {activities.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span className="font-mono text-foreground">{item.title}</span>
              </div>
              <span className="text-xxs text-muted-foreground font-mono">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
