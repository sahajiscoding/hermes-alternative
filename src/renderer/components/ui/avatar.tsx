import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'default' | 'lg'
}

export function Avatar({ className, size = 'default', ...props }: AvatarProps) {
  const sizeStyles = {
    sm: 'size-7',
    default: 'size-9',
    lg: 'size-12',
  }[size]

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border border-border bg-muted',
        sizeStyles,
        className
      )}
      {...props}
    />
  )
}

export function AvatarImage({
  src,
  alt = '',
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  )
}

export function AvatarFallback({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
