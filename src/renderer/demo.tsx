import type { ReactNode } from 'react'
import DashboardLayout from './dashboard-layout'
import { ApiKeysPage } from './components/agndex/api-keys-page'
import { DashboardPage } from './components/agndex/dashboard-page'
import { RegistrationPage } from './components/registration/registration-page'
import { TerminalView } from './components/views/terminal-view'
import { MobileLinkView } from './components/views/mobile-link-view'
import { TournamentView } from './components/views/tournament-view'
import { CrashOutView } from './components/views/crashout-view'
import { StudioPage } from './components/studio/studio-page'
import { MobileApp } from './mobile/mobile-app'
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from './components/agndex/navigation'
import { ThemeProvider } from './components/agndex/theme-provider'

function DashboardRoute() {
  const { pathname } = useDashboardNavigation()

  // If mobile path is targeted (e.g. from local server request from phone)
  if (
    pathname === '/mobile' ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/mobile'))
  ) {
    return <MobileApp />
  }

  let content: ReactNode = <DashboardPage />

  if (pathname === '/register' || pathname === '/settings') {
    content = <RegistrationPage />
  } else if (pathname === '/api-keys') {
    content = <ApiKeysPage />
  } else if (pathname === '/studio') {
    content = <StudioPage />
  } else if (pathname === '/terminal') {
    content = <TerminalView />
  } else if (pathname === '/mobile-link') {
    content = <MobileLinkView />
  } else if (pathname === '/tournament') {
    content = <TournamentView />
  } else if (pathname === '/crash-out') {
    content = <CrashOutView />
  }

  return <DashboardLayout>{content}</DashboardLayout>
}

export default function HermesApp() {
  return (
    <ThemeProvider>
      <DashboardNavigationProvider>
        <DashboardRoute />
      </DashboardNavigationProvider>
    </ThemeProvider>
  )
}
