import { useState, useEffect } from 'react'
import {
  BadgeCheckIcon,
  ChevronsUpDownIcon,
  ShieldIcon,
  UserPlusIcon,
  UsersIcon,
  UserCheck,
  KeyRound,
  Smartphone,
  RotateCcw,
} from 'lucide-react'
import { HermesLogo } from './logo'
import { DashboardLink, useDashboardNavigation } from './navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  getCurrentUser,
  footerNavigation,
  navigationGroups,
  type NavigationItem,
} from '../../data'

function NavItem({ item }: { item: NavigationItem }) {
  const { pathname } = useDashboardNavigation()
  const { isMobile, setOpenMobile } = useSidebar()
  const active =
    item.href === '/'
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`)
  const className =
    'flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-smd tracking-tight text-sidebar-muted-foreground opacity-80 aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:opacity-100 transition-colors'

  function handleClick() {
    if (isMobile) setOpenMobile(false)
  }

  return (
    <SidebarMenuButton asChild className="h-auto p-0">
      {item.external ? (
        <a
          href={item.href}
          target="_blank"
          rel="noreferrer"
          onClick={handleClick}
          className={className}
        >
          <div className="flex items-center gap-2.5">
            <item.icon />
            <span>{item.name}</span>
          </div>
          {item.badge && (
            <span className="text-xxs px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold border border-primary/20">
              {item.badge}
            </span>
          )}
        </a>
      ) : (
        <DashboardLink
          href={item.href}
          aria-current={active ? 'page' : undefined}
          onClick={handleClick}
          className={className}
        >
          <div className="flex items-center gap-2.5">
            <item.icon />
            <span>{item.name}</span>
          </div>
          {item.badge && (
            <span className="text-xxs px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              {item.badge}
            </span>
          )}
        </DashboardLink>
      )}
    </SidebarMenuButton>
  )
}

export function DashboardSidebar() {
  const { navigate } = useDashboardNavigation()
  const [user, setUser] = useState(getCurrentUser())

  useEffect(() => {
    function handleUpdate() {
      setUser(getCurrentUser())
    }
    window.addEventListener('hermes-profile-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('hermes-profile-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  return (
    <Sidebar className="border-r border-border h-full bg-sidebar">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 pt-5 pb-0">
        <div className="flex items-center gap-2">
          <HermesLogo className="size-5.5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            HERMES
          </span>
        </div>
        <span className="rounded-md border border-border bg-sidebar-badge px-2 py-0.5 text-xxs font-medium text-sidebar-foreground/80">
          Desktop Agent
        </span>
      </SidebarHeader>

      <SidebarContent className="mt-6 gap-6 px-3">
        {navigationGroups.map((group) => (
          <SidebarGroup key={group.label} className="p-0">
            <SidebarGroupLabel className="mb-1 h-auto px-1 py-1 text-xs text-sidebar-muted font-medium">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <NavItem item={item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-3 pb-4">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto gap-2.5 rounded-lg px-2.5 py-2 text-smd data-open:bg-sidebar-accent cursor-pointer">
                  <Avatar size="sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 text-left overflow-hidden">
                    <span className="font-medium tracking-tight text-xs text-foreground truncate">
                      {user.name}
                    </span>
                    <span className="text-xxs text-emerald-500 font-mono flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Local Host
                    </span>
                  </div>
                  <ChevronsUpDownIcon className="size-4 text-sidebar-foreground/50 shrink-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="agndex-dashboard w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight overflow-hidden">
                      <p className="text-xs font-medium text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-xxs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate('/register')} className="cursor-pointer">
                    <UserCheck className="size-4" />
                    Registration & Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/mobile-link')} className="cursor-pointer">
                    <Smartphone className="size-4" />
                    Mobile Companion
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/api-keys')} className="cursor-pointer">
                    <KeyRound className="size-4" />
                    BYOK Key Vault
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (confirm('Clear local app cache and reload?')) {
                      localStorage.clear()
                      window.location.reload()
                    }
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <RotateCcw className="size-4" />
                  Reset Cache
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
