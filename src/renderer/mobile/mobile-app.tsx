import { useState, useEffect, useRef } from 'react'
import { Terminal, Send, Play, Square, CheckCircle, Moon, Smartphone, ShieldCheck, RefreshCw } from 'lucide-react'

export function MobileApp() {
  const [pin, setPin] = useState('')
  const [isPaired, setIsPaired] = useState(false)
  const [messages, setMessages] = useState<Array<{ role: string; content: string; time: string }>>([
    {
      role: 'agent',
      content: 'Hermes Remote Companion connected via Sesori API. Desktop host is awake.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])
  const [prompt, setPrompt] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [sleepPrevention, setSleepPrevention] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if PIN in query parameters
    const params = new URLSearchParams(window.location.search)
    const pinParam = params.get('pin') || params.get('token')
    if (pinParam) {
      setPin(pinParam)
      setIsPaired(true)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    if (!prompt.trim() || isRunning) return

    const userMsg = {
      role: 'user',
      content: prompt,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => [...prev, userMsg])
    setPrompt('')
    setIsRunning(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'agent',
          content: 'Command dispatched to Windows Desktop host.\n[tool:run_command] Executing git status...\nResult: Everything clean and up to date.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsRunning(false)
    }, 1200)
  }

  function handlePairSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.trim().length >= 4) {
      setIsPaired(true)
    }
  }

  if (!isPaired) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm flex flex-col items-center gap-6 text-center">
          <div className="size-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-100 shadow-xl">
            <Smartphone className="size-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Hermes Mobile Control</h1>
            <p className="text-xs text-zinc-400 mt-1">Enter the 6-digit PIN shown on your desktop screen</p>
          </div>
          <form onSubmit={handlePairSubmit} className="w-full flex flex-col gap-3">
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="000000"
              className="w-full h-14 rounded-xl bg-zinc-900 border border-zinc-800 text-center text-2xl font-mono tracking-widest text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-sm active:scale-98 transition-transform cursor-pointer"
            >
              Pair with Desktop
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between px-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-sm tracking-tight">Hermes Remote</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSleepPrevention(!sleepPrevention)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xxs font-medium border ${
              sleepPrevention
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            <Moon className="size-3" />
            <span>{sleepPrevention ? 'Host Awake' : 'Sleep Default'}</span>
          </button>
        </div>
      </header>

      {/* Main Message Stream */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col gap-1 p-3.5 rounded-2xl max-w-[85%] text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-zinc-100 text-zinc-950 rounded-br-xs'
                : 'mr-auto bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-xs'
            }`}
          >
            <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{m.content}</div>
            <span
              className={`text-xxs mt-0.5 ${
                m.role === 'user' ? 'text-zinc-500 text-right' : 'text-zinc-500'
              }`}
            >
              {m.time}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Quick Action Buttons for Approvals */}
      <div className="p-3 border-t border-zinc-800/60 bg-zinc-900/50 flex gap-2">
        <button
          onClick={() => {
            setMessages((prev) => [
              ...prev,
              { role: 'user', content: 'Approved tool action.', time: new Date().toLocaleTimeString() },
            ])
          }}
          className="flex-1 h-11 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold active:scale-95 transition-transform"
        >
          Approve Action
        </button>
        <button
          onClick={() => {
            setMessages((prev) => [
              ...prev,
              { role: 'user', content: 'Rejected tool action.', time: new Date().toLocaleTimeString() },
            ])
          }}
          className="flex-1 h-11 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs font-semibold active:scale-95 transition-transform"
        >
          Reject Action
        </button>
      </div>

      {/* Mobile Input Field */}
      <footer className="p-3 border-t border-zinc-800 bg-zinc-950 flex gap-2 items-center safe-area-bottom">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send prompt or instruction to PC..."
          className="flex-1 h-12 rounded-xl bg-zinc-900 border border-zinc-800 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
        />
        <button
          onClick={handleSend}
          disabled={!prompt.trim() || isRunning}
          className="size-12 rounded-xl bg-zinc-100 text-zinc-950 flex items-center justify-center font-bold disabled:opacity-40 active:scale-95 transition-transform cursor-pointer"
        >
          {isRunning ? <RefreshCw className="size-5 animate-spin" /> : <Send className="size-5" />}
        </button>
      </footer>
    </div>
  )
}
