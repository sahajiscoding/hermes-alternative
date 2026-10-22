import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'

export const HermesLogo = ({ className, ...props }: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn('size-6', className)}
    {...props}
  >
    <rect width="24" height="24" rx="6" className="fill-primary/10" />
    <path
      d="M13 3L4 14H12L11 21L20 10H12L13 3Z"
      className="fill-primary stroke-primary"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const AgndexLogo = HermesLogo
