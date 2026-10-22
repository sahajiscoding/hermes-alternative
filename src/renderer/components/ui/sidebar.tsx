import * as React from 'react'
import { PanelLeftIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarContextType {
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextType>({
  open: true,
  setOpen: () => {},
  openMobile: false,
  setOpenMobile: () => {},
  isMobile: false,
  toggleSidebar: () => {},
})

export function useSidebar() {
  return React.useContext(SidebarContext)
}

export function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
}: {
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  style?: React.CSSProperties
}) {
  const [openState, setOpenState] = React.useState(defaultOpen)
  const [openMobile, setOpenMobile] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  const open = openProp ?? openState
  const setOpen = (value: boolean) => {
    setOpenState(value)
    onOpenChange?.(value)
  }

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile(!openMobile)
    } else {
      setOpen(!open)
    }
  }

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
        toggleSidebar,
      }}
    >
      <div
        className={cn('flex w-full overflow-hidden', className)}
        style={style}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const { open, openMobile, setOpenMobile, isMobile } = useSidebar()

  if (isMobile) {
    if (!openMobile) return null
    return (
      <div className="fixed inset-0 z-50 flex">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          onClick={() => setOpenMobile(false)}
        />
        <aside
          className={cn(
            'relative z-50 flex h-full w-[var(--sidebar-width,17.25rem)] flex-col border-r border-border bg-sidebar text-sidebar-foreground shadow-2xl animate-in slide-in-from-left duration-200',
            className
          )}
        >
          {children}
        </aside>
      </div>
    )
  }

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-in-out',
        open ? 'w-[var(--sidebar-width,17.25rem)]' : 'w-0 overflow-hidden',
        className
      )}
    >
      {children}
    </aside>
  )
}

export function SidebarHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2 p-4', className)}>
      {children}
    </div>
  )
}

export function SidebarContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-1 flex-col overflow-y-auto px-2', className)}>
      {children}
    </div>
  )
}

export function SidebarFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2 p-4 mt-auto border-t border-border/50', className)}>
      {children}
    </div>
  )
}

export function SidebarGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col py-2', className)}>{children}</div>
}

export function SidebarGroupLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-2 py-1.5 text-xs font-medium text-sidebar-muted uppercase tracking-wider', className)}>
      {children}
    </div>
  )
}

export function SidebarGroupContent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col gap-0.5', className)}>{children}</div>
}

export function SidebarMenu({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <ul className={cn('flex flex-col list-none p-0 m-0', className)}>{children}</ul>
}

export function SidebarMenuItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <li className={cn('relative', className)}>{children}</li>
}

export function SidebarMenuButton({
  children,
  asChild,
  className,
  onClick,
  type = 'button',
  ...props
}: {
  children: React.ReactNode
  asChild?: boolean
  className?: string
  onClick?: (e: React.MouseEvent) => void
  type?: 'button' | 'submit' | 'reset'
  [key: string]: any
}) {
  if (asChild && React.isValidElement(children)) {
    const childElement = children as React.ReactElement<any>
    const childProps = childElement.props || {}
    return React.cloneElement(childElement, {
      className: cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer',
        childProps.className,
        className
      ),
      onClick: (e: React.MouseEvent) => {
        childProps.onClick?.(e)
        onClick?.(e)
      },
      ...props,
    })
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer text-left',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      type="button"
      onClick={(e) => {
        toggleSidebar()
        onClick?.(e)
      }}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background p-2 text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer',
        className
      )}
      aria-label="Toggle Sidebar"
      {...props}
    >
      <PanelLeftIcon className="size-4" />
    </button>
  )
}
