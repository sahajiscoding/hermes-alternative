import * as React from 'react'
import { cn } from '@/lib/utils'

interface DropdownContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const DropdownContext = React.createContext<DropdownContextType>({
  open: false,
  setOpen: () => {},
})

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={menuRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

export function DropdownMenuTrigger({
  children,
  asChild,
  className,
  ...props
}: {
  children: React.ReactElement<any>
  asChild?: boolean
  className?: string
  [key: string]: any
}) {
  const { open, setOpen } = React.useContext(DropdownContext)

  const handleClick = (e: React.MouseEvent) => {
    children.props?.onClick?.(e)
    setOpen(!open)
  }

  return React.cloneElement(children, {
    onClick: handleClick,
    'data-open': open ? '' : undefined,
    'aria-expanded': open,
    ...props,
  } as any)
}

export function DropdownMenuContent({
  children,
  className,
  align = 'start',
  side = 'bottom',
}: {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'end' | 'center'
  side?: 'top' | 'bottom'
}) {
  const { open } = React.useContext(DropdownContext)

  if (!open) return null

  const alignStyles = {
    start: 'left-0',
    end: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  }[align]

  const sideStyles = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
  }[side]

  return (
    <div
      className={cn(
        'absolute z-50 min-w-[8rem] overflow-hidden rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95',
        alignStyles,
        sideStyles,
        className
      )}
    >
      {children}
    </div>
  )
}

export function DropdownMenuGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('flex flex-col gap-0.5', className)}>{children}</div>
}

export function DropdownMenuItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  const { setOpen } = React.useContext(DropdownContext)

  return (
    <button
      type="button"
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-left',
        className
      )}
    >
      {children}
    </button>
  )
}

export function DropdownMenuLabel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('px-2.5 py-1.5 text-xs font-semibold text-muted-foreground', className)}>
      {children}
    </div>
  )
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('-mx-1 my-1 h-px bg-border', className)} />
}

interface RadioGroupContextType {
  value: string
  onValueChange: (value: string) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextType>({
  value: '',
  onValueChange: () => {},
})

export function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
}: {
  value: string
  onValueChange: (val: string) => void
  children: React.ReactNode
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className="flex flex-col gap-0.5">{children}</div>
    </RadioGroupContext.Provider>
  )
}

export function DropdownMenuRadioItem({
  value,
  children,
  className,
}: {
  value: string
  children: React.ReactNode
  className?: string
}) {
  const { value: selectedValue, onValueChange } = React.useContext(RadioGroupContext)
  const { setOpen } = React.useContext(DropdownContext)
  const isChecked = selectedValue === value

  return (
    <button
      type="button"
      data-state={isChecked ? 'checked' : 'unchecked'}
      onClick={() => {
        onValueChange(value)
        setOpen(false)
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground text-left',
        className
      )}
    >
      {children}
    </button>
  )
}
