import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Smartphone,
  Copy,
  Check,
  Moon,
  ShieldCheck,
  Wifi,
  ExternalLink,
  RefreshCw,
  Trash2,
  QrCode,
  Laptop,
} from 'lucide-react'
import QRCode from 'qrcode'

interface NetworkInterface {
  name: string
  ip: string
  isPreferred?: boolean
}

interface RegisteredDevice {
  id: string
  name: string
  token: string
  pairedAt: string
  lastSeen: string
  ip?: string
}

export function MobileLinkView() {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [lanIp, setLanIp] = useState('192.168.1.3')
  const [availableIps, setAvailableIps] = useState<NetworkInterface[]>([])
  const [port, setPort] = useState(4152)
  const [pairingPin, setPairingPin] = useState('742819')
  const [sleepPrevention, setSleepPrevention] = useState(true)
  const [copied, setCopied] = useState(false)
  const [registeredDevices, setRegisteredDevices] = useState<RegisteredDevice[]>([])
  const [isRotating, setIsRotating] = useState(false)

  const mobileUrl = `http://${lanIp}:${port}/mobile?pin=${pairingPin}`

  // Fetch real LAN IP, interfaces, and PIN
  useEffect(() => {
    async function loadServerInfo() {
      // 1. Try Electron IPC
      if ((window as any).electron?.getServerInfo) {
        try {
          const info = await (window as any).electron.getServerInfo()
          if (info) {
            if (info.ip) setLanIp(info.ip)
            if (info.port) setPort(info.port)
            if (info.pin) setPairingPin(info.pin)
            if (info.interfaces) setAvailableIps(info.interfaces)
            if (info.registeredDevices) setRegisteredDevices(info.registeredDevices)
          }
        } catch (e) {
          console.warn('IPC getServerInfo error', e)
        }
      }

      // 2. Also try direct HTTP fetch from local server
      try {
        const host = window.location.hostname || 'localhost'
        const res = await fetch(`http://${host}:4152/api/v1/network`)
        if (res.ok) {
          const data = await res.json()
          if (data.primaryIp) setLanIp(data.primaryIp)
          if (data.port) setPort(data.port)
          if (data.pin) setPairingPin(data.pin)
          if (data.interfaces && data.interfaces.length > 0) {
            setAvailableIps(data.interfaces)
          }
        }
      } catch (e) {
        if (window.location.hostname && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
          setLanIp(window.location.hostname)
        }
      }

      // 3. Load registered devices
      try {
        const host = window.location.hostname || 'localhost'
        const devRes = await fetch(`http://${host}:4152/api/v1/devices`)
        if (devRes.ok) {
          const devs = await devRes.json()
          setRegisteredDevices(devs)
        }
      } catch (e) {}
    }

    loadServerInfo()
  }, [])

  // Regenerate QR code whenever mobileUrl changes
  useEffect(() => {
    QRCode.toDataURL(mobileUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
    }).then(setQrDataUrl)
  }, [mobileUrl])

  function handleCopy() {
    void navigator.clipboard.writeText(mobileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  async function rotatePin() {
    setIsRotating(true)
    try {
      if ((window as any).electron?.rotatePin) {
        const res = await (window as any).electron.rotatePin()
        if (res?.pin) setPairingPin(res.pin)
      } else {
        const host = window.location.hostname || 'localhost'
        const res = await fetch(`http://${host}:4152/api/v1/pin/rotate`, { method: 'POST' })
        if (res.ok) {
          const data = await res.json()
          if (data.pin) setPairingPin(data.pin)
        } else {
          setPairingPin(Math.floor(100000 + Math.random() * 900000).toString())
        }
      }
    } catch (e) {
      setPairingPin(Math.floor(100000 + Math.random() * 900000).toString())
    } finally {
      setIsRotating(false)
    }
  }

  async function handleRevokeDevice(id: string) {
    try {
      if ((window as any).electron?.revokeDevice) {
        await (window as any).electron.revokeDevice(id)
      } else {
        const host = window.location.hostname || 'localhost'
        await fetch(`http://${host}:4152/api/v1/devices/${id}`, { method: 'DELETE' })
      }
      setRegisteredDevices((prev) => prev.filter((d) => d.id !== id))
    } catch (e) {
      setRegisteredDevices((prev) => prev.filter((d) => d.id !== id))
    }
  }

  function toggleSleep() {
    const next = !sleepPrevention
    setSleepPrevention(next)
    if ((window as any).electron?.setSleepPrevention) {
      ;(window as any).electron.setSleepPrevention(next)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
            <Smartphone className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Mobile Remote Companion
            </h1>
            <p className="text-muted-foreground text-xs md:text-sm">
              Control and steer running desktop agent tasks from any smartphone on your local Wi-Fi.
            </p>
          </div>
        </div>

        <Badge variant="outline" className="text-purple-400 border-purple-500/30 bg-purple-500/10 text-xs px-3 py-1 font-mono">
          <Wifi className="size-3.5 mr-1.5 text-emerald-500" />
          Sesori API v1 Ready
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* QR Code Card */}
        <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-border bg-card text-center">
          <div className="p-3.5 bg-white rounded-2xl shadow-sm border border-zinc-200">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Pairing QR Code" className="size-52 rounded-xl object-contain" />
            ) : (
              <div className="size-52 flex items-center justify-center text-xs text-muted-foreground font-mono">
                Generating QR...
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">6-Digit Pairing PIN:</span>
              <button
                onClick={rotatePin}
                title="Generate new PIN"
                className="size-7 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <span className="text-3xl font-mono font-bold tracking-widest text-foreground">{pairingPin}</span>
          </div>

          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            Open the Camera on your phone connected to the same Wi-Fi network to instantly launch the remote controller.
          </p>
        </div>

        {/* Connection Details & Setup */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wifi className="size-4 text-emerald-500" />
                <span>Local Network Endpoint</span>
              </div>
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 text-xs font-mono">
                Port {port} (Online)
              </Badge>
            </div>

            {/* Network interface selection if multiple found */}
            {availableIps.length > 1 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted-foreground font-semibold">Active Interface:</label>
                <select
                  value={lanIp}
                  onChange={(e) => {
                    setLanIp(e.target.value)
                    if ((window as any).electron?.setPrimaryIp) {
                      ;(window as any).electron.setPrimaryIp(e.target.value)
                    }
                  }}
                  className="h-10 px-3 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:outline-none"
                >
                  {availableIps.map((iface) => (
                    <option key={iface.ip} value={iface.ip}>
                      {iface.name} ({iface.ip}) {iface.isPreferred ? '— Recommended' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2">
              <code className="flex-1 p-2.5 rounded-xl bg-background text-xs font-mono truncate text-foreground border border-border select-all">
                {mobileUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="size-10 shrink-0 text-muted-foreground cursor-pointer"
                title="Copy URL"
              >
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>

            <Button
              variant="secondary"
              className="w-full text-xs gap-1.5 h-10 font-medium cursor-pointer"
              onClick={() => window.open(mobileUrl, '_blank')}
            >
              <ExternalLink className="size-3.5" />
              <span>Test Mobile View in Desktop Browser</span>
            </Button>
          </div>

          {/* Win32 Sleep Prevention Pill */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3">
              <div className={`size-9 rounded-xl flex items-center justify-center ${sleepPrevention ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                <Moon className="size-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Win32 Sleep Prevention</span>
                <span className="text-xs text-muted-foreground">Keep desktop awake while tasks run</span>
              </div>
            </div>
            <button
              onClick={toggleSleep}
              className={`h-9 px-3.5 rounded-xl text-xs font-medium cursor-pointer transition-colors border ${
                sleepPrevention
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 font-mono'
                  : 'bg-muted text-muted-foreground border-border'
              }`}
            >
              {sleepPrevention ? 'Awake Active' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      {/* Registered & Paired Devices Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-emerald-500" />
            <h2 className="text-base font-semibold text-foreground">Registered Companion Devices</h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {registeredDevices.length} active device{registeredDevices.length === 1 ? '' : 's'}
          </span>
        </div>

        {registeredDevices.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-border bg-card text-center text-xs text-muted-foreground">
            No devices registered yet. Scan the QR code above with your smartphone on Wi-Fi to pair automatically.
          </div>
        ) : (
          <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
            {registeredDevices.map((dev) => (
              <div key={dev.id} className="flex items-center justify-between p-4 text-xs">
                <div className="flex items-center gap-3.5">
                  <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Smartphone className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-sm">{dev.name}</span>
                    <span className="text-xxs text-muted-foreground font-mono">
                      Paired {new Date(dev.pairedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Token: {dev.token.slice(0, 16)}...
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xxs font-mono">
                    Paired
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevokeDevice(dev.id)}
                    className="size-8 text-muted-foreground hover:text-rose-500 cursor-pointer"
                    title="Revoke device access"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
