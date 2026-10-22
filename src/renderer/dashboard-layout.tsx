import type { CSSProperties, ReactNode } from 'react'
import { DashboardSidebar } from './components/agndex/sidebar'
import { DashboardTopbar } from './components/agndex/topbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import './dashboard.css'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider
      defaultOpen
      className="agndex-dashboard h-screen w-screen overflow-hidden no-scrollbar bg-background text-foreground"
      style={
        {
          '--sidebar-width': '17.25rem',
        } as CSSProperties
      }
    >
      <DashboardSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        <DashboardTopbar />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </SidebarProvider>
  )
}
