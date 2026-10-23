import type { ReactNode } from 'react'

type DashboardLayoutProps = {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-background dark:bg-neutral-950 text-foreground dark:text-neutral-50">
      <main className="w-full max-w-6xl mx-auto px-4 py-16 md:py-24">{children}</main>
    </div>
  )
}