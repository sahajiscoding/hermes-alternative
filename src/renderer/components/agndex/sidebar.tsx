import {
  BadgeCheckIcon,
  ChevronsUpDownIcon,
  ShieldIcon,
  UserPlusIcon,
  UsersIcon,
} from 'lucide-react'
import { AgndexLogo } from './logo'
import { DashboardLink, useDashboardNavigation } from './navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  currentUser,
  footerNavigation,
  logoutItem,
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
    'gap-2.5 rounded-lg px-3 py-2 text-smd tracking-tight text-sidebar-muted-foreground opacity-80 aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:opacity-100 transition-colors'

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
          <item.icon />
          <span>{item.name}</span>
        </a>
      ) : (
        <DashboardLink
          href={item.href}
          aria-current={active ? 'page' : undefined}
          onClick={handleClick}
          className={className}
        >
          <item.icon />
          <span>{item.name}</span>
        </DashboardLink>
      )}
    </SidebarMenuButton>
  )
}

export function DashboardSidebar() {
  return (
    <Sidebar className="border-r border-border h-full bg-sidebar">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 pt-5 pb-0">
        <div className="flex items-center gap-2">
          <AgndexLogo className="size-5.5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            HERMES
          </span>
        </div>
        <span className="rounded-md border border-border bg-sidebar-badge px-2 py-0.5 text-xxs font-medium text-sidebar-foreground/80">
          Agent 2.0
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
          {footerNavigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <NavItem item={item} />
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton
              type="button"
              className="h-auto gap-2.5 rounded-lg px-3 py-2 text-smd tracking-tight text-sidebar-muted-foreground opacity-80 hover:bg-destructive/10 hover:text-destructive hover:opacity-100"
              onClick={() => {
                if (confirm('Clear local agent session cache?')) {
                  localStorage.clear()
                  window.location.reload()
                }
              }}
            >
              <logoutItem.icon className="-rotate-90 size-4" />
              <span>Reset State</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-auto gap-2.5 rounded-lg px-3 py-2 text-smd data-open:bg-sidebar-accent">
                  <Avatar size="sm">
                    <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium tracking-tight text-xs">
                    {currentUser.name}
                  </span>
                  <ChevronsUpDownIcon className="size-4 text-sidebar-foreground/50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="agndex-dashboard w-60">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.initials}</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight">
                      <p className="text-xs font-medium text-foreground">
                        {currentUser.name}
                      </p>
                      <p className="text-xxs text-muted-foreground">{currentUser.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheckIcon className="size-4" />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ShieldIcon className="size-4" />
                    Security Vault
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
