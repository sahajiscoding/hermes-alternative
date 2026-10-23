import type { ReactNode } from 'react'
import DashboardLayout from './dashboard-layout'
import { DashboardPage } from './components/agndex/dashboard-page'
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from './components/agndex/navigation'
import { ThemeProvider } from './components/agndex/theme-provider'

function DashboardRoute() {
  return <DashboardLayout><DashboardPage /></DashboardLayout>
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
