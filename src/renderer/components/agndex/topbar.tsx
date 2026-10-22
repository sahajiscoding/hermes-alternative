import { useState, useEffect } from 'react'
import { ThemeToggle } from './theme-toggle'
import { useDashboardNavigation } from './navigation'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { navigationGroups } from '../../data'
import { Smartphone, QrCode, UserCheck, ShieldCheck } from 'lucide-react'

const navigationItems = navigationGroups.flatMap((group) => group.items)

export function DashboardTopbar() {
  const { pathname, navigate } = useDashboardNavigation()
  const [hostIp, setHostIp] = useState('192.168.1.3')

  useEffect(() => {
    if ((window as any).electron?.getServerInfo) {
      ;(window as any).electron.getServerInfo().then((info: any) => {
        if (info?.ip) setHostIp(info.ip)
      })
    }
  }, [])

  const currentPage =
    navigationItems.find(({ href }) =>
      href === '/'
        ? pathname === href
        : pathname === href || pathname.startsWith(`${href}/`),
    ) ?? navigationItems[0]

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 px-4 border-b border-border bg-background md:h-16 md:px-6">
      <div className="flex items-center gap-2.5">
        <SidebarTrigger className="size-9 md:hidden cursor-pointer" />
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground tracking-tight text-base">{currentPage.name}</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xxs font-mono">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {hostIp}:4152
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/register')}
          className="h-8 gap-1.5 px-2.5 text-xs font-normal cursor-pointer hidden sm:flex"
        >
          <UserCheck className="size-3.5 text-primary" />
          <span>Registration</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/mobile-link')}
          className="h-8 gap-1.5 px-2.5 text-xs font-normal cursor-pointer"
        >
          <QrCode className="size-3.5 text-emerald-500" />
          <span className="hidden sm:inline">Pair Mobile</span>
        </Button>

        <ThemeToggle />
      </div>
    </header>
  )
}
