import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Smartphone, QrCode, Copy, Check, Moon, ShieldCheck, Wifi, ExternalLink } from 'lucide-react'
import QRCode from 'qrcode'

export function MobileLinkView() {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [lanIp, setLanIp] = useState('192.168.1.45')
  const [port, setPort] = useState(4152)
  const [pairingPin, setPairingPin] = useState('742819')
  const [sleepPrevention, setSleepPrevention] = useState(true)
  const [copied, setCopied] = useState(false)

  const mobileUrl = `http://${lanIp}:${port}/mobile?pin=${pairingPin}`

  useEffect(() => {
    // Generate QR code
    QRCode.toDataURL(mobileUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#09090b',
        light: '#ffffff',
      },
    }).then(setQrDataUrl)

    if ((window as any).electron?.getServerInfo) {
      ;(window as any).electron.getServerInfo().then((info: any) => {
        if (info) {
          setLanIp(info.ip)
          setPort(info.port)
          if (info.pin) setPairingPin(info.pin)
        }
      })
    }
  }, [mobileUrl])

  function handleCopy() {
    void navigator.clipboard.writeText(mobileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function toggleSleep() {
    const next = !sleepPrevention
    setSleepPrevention(next)
    if ((window as any).electron?.setSleepPrevention) {
      ;(window as any).electron.setSleepPrevention(next)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 md:gap-10 md:p-8">
      <div className="flex flex-col md:gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Mobile Remote Companion</h1>
        <p className="text-muted-foreground text-sm">
          Run and steer your coding agents directly from your phone with the open-source Sesori API.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* QR Code Card */}
        <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-border bg-card shadow-xs text-center">
          <div className="p-3 bg-white rounded-xl shadow-xs border border-border">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Pairing QR Code" className="size-52 rounded-lg object-contain" />
            ) : (
              <div className="size-52 flex items-center justify-center text-xs text-muted-foreground">
                Generating QR...
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Ephemeral Pairing PIN:</span>
            <span className="text-2xl font-mono font-bold tracking-widest text-primary">{pairingPin}</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-xs">
            Open camera on your iPhone or Android device connected to the same Wi-Fi network to instantly launch the remote controller.
          </p>
        </div>

        {/* Connection Details & Options */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wifi className="size-4 text-emerald-500" />
              <span>Local Network Endpoint</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 p-2 rounded-lg bg-muted text-xs font-mono truncate text-foreground">
                {mobileUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className="size-9 shrink-0 text-muted-foreground"
              >
                {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <a
              href={mobileUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              <span>Open in browser tab</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Sleep Prevention Card */}
          <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Moon className="size-4 text-primary" />
                <span>Windows Sleep Prevention</span>
              </div>
              <Badge
                variant="outline"
                className={
                  sleepPrevention
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground'
                }
              >
                {sleepPrevention ? 'Active (Awake)' : 'System Default'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uses Win32 <code className="text-foreground">SetThreadExecutionState</code> to prevent your PC from sleeping while background agent jobs run or while mobile connections are active.
            </p>
            <Button
              variant={sleepPrevention ? 'secondary' : 'default'}
              size="sm"
              onClick={toggleSleep}
              className="w-full text-xs h-9"
            >
              {sleepPrevention ? 'Disable Sleep Prevention' : 'Keep Computer Awake'}
            </Button>
          </div>

          {/* Sesori API Info */}
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-medium">
              <ShieldCheck className="size-4 text-info" />
              <span>Sesori API Specification Ready</span>
            </div>
            <p>
              Exposes standard Sesori REST and WebSocket endpoints: <code className="text-foreground">/api/v1/sessions</code>, <code className="text-foreground">/api/v1/devices/pair</code>, and <code className="text-foreground">/ws/agent-stream</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
