import type { ReactNode } from 'react'
import DashboardLayout from './dashboard-layout'
import { ApiKeysPage } from './components/agndex/api-keys-page'
import { BillingPage } from './components/agndex/billing-page'
import { DashboardPage } from './components/agndex/dashboard-page'
import { TerminalView } from './components/views/terminal-view'
import { MobileLinkView } from './components/views/mobile-link-view'
import { TournamentView } from './components/views/tournament-view'
import { CrashOutView } from './components/views/crashout-view'
import { MobileApp } from './mobile/mobile-app'
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from './components/agndex/navigation'
import { ThemeProvider } from './components/agndex/theme-provider'

function DashboardRoute() {
  const { pathname } = useDashboardNavigation()

  // If mobile path is targeted (e.g. from local server request)
  if (pathname === '/mobile' || window.location.pathname === '/mobile') {
    return <MobileApp />
  }

  let content: ReactNode = <DashboardPage />

  if (pathname === '/api-keys') {
    content = <ApiKeysPage />
  } else if (pathname === '/billing') {
    content = <BillingPage />
  } else if (pathname === '/terminal') {
    content = <TerminalView />
  } else if (pathname === '/mobile-link') {
    content = <MobileLinkView />
  } else if (pathname === '/tournament') {
    content = <TournamentView />
  } else if (pathname === '/crash-out') {
    content = <CrashOutView />
  } else if (pathname === '/docs') {
    content = (
      <div className="p-8 max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold">Hermes Alternative Documentation</h1>
        <p className="text-muted-foreground text-sm">
          Hermes Alternative is an autonomous desktop coding agent designed to run long agentic tasks locally on Windows with zero cloud lock-in.
        </p>
        <div className="p-4 rounded-xl border border-border bg-card space-y-2 text-xs">
          <h2 className="font-semibold text-sm">Key Capabilities</h2>
          <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
            <li><strong>BYOK Vault:</strong> Bring your own keys for OpenAI, Anthropic, Gemini, Groq, OpenRouter, and local Ollama.</li>
            <li><strong>Sesori Mobile API:</strong> Control and monitor running agent loops directly from your smartphone over Wi-Fi.</li>
            <li><strong>Win32 Sleep Prevention:</strong> Keeps the desktop system awake without screen glare while jobs execute.</li>
            <li><strong>Tri-Engine Specialization:</strong> Anti-slop (<code className="text-primary">larp</code>), 6-agent tournament (<code className="text-primary">67</code>), and self-attacking stress-testing (<code className="text-primary">crash-out</code>).</li>
          </ul>
        </div>
      </div>
    )
  }

  return <DashboardLayout>{content}</DashboardLayout>
}

export default function AgndexDashboardDemo() {
  return (
    <ThemeProvider>
      <DashboardNavigationProvider>
        <DashboardRoute />
      </DashboardNavigationProvider>
    </ThemeProvider>
  )
}
