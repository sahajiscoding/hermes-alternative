import React from 'react'
import ReactDOM from 'react-dom/client'
import HermesApp from './demo'
import LandingPage from './landing-page'
import { MobileApp } from './mobile/mobile-app'
import './index.css'

// The same renderer bundle powers three surfaces:
// - Electron desktop app -> full agent dashboard
// - Phone browser at /mobile -> mobile companion
// - Website (Vercel) -> download landing page only
const isDesktop = typeof window !== 'undefined' && Boolean((window as any).electron)
const isMobileCompanion =
  typeof window !== 'undefined' && window.location.pathname.startsWith('/mobile')

function Root() {
  if (isDesktop) return <HermesApp />
  if (isMobileCompanion) return <MobileApp />
  return <LandingPage />
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
