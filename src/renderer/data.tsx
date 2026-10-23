import type { ComponentType, SVGProps } from 'react'
import {
  HomeIcon,
  DownloadIcon,
  LogoutIcon,
} from './components/agndex/icons'

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>

export type NavigationItem = {
  name: string
  href: string
  icon: NavIcon
  external?: boolean
  badge?: string
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Overview',
    items: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
    ],
  },
]

export const footerNavigation: NavigationItem[] = []

export const logoutItem = {
  name: 'Reset Local Vault',
  icon: LogoutIcon,
}

export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('hermes_user_profile')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          name: parsed.name || 'Sahaj',
          email: parsed.email || 'developer@hermes.local',
          avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(parsed.name || 'Sahaj')}`,
          initials: (parsed.name || 'S').slice(0, 2).toUpperCase(),
        }
      } catch (e) {}
    }
  }
  return {
    name: 'Sahaj',
    email: 'developer@hermes.local',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sahaj',
    initials: 'SH',
  }
}

export const currentUser = getCurrentUser()

export const defaultWorkspace = {
  name: 'Hermes Workspace',
  path: 'c:\\Users\\kids\\Desktop\\Backup Folders\\sahaj ke programs\\hermes-alternative',
}
