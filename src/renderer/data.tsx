import type { ComponentType, SVGProps } from 'react'
import {
  ChatIcon,
  HomeIcon,
  KeyIcon,
  ProjectIcon,
  SettingsIcon,
  IndexesIcon,
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
      { name: 'Agent Chat', href: '/', icon: ChatIcon },
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
      { name: 'Registration & Setup', href: '/register', icon: ProjectIcon, badge: 'New' },
      { name: 'Mobile Companion', href: '/mobile-link', icon: ProjectIcon },
    ],
  },
  {
    label: 'Developer Tools',
    items: [
      { name: 'Agent Terminal', href: '/terminal', icon: IndexesIcon },
    ],
  },
  {
    label: 'Evaluation Modes',
    items: [
      { name: '6-Agent Tournament', href: '/tournament', icon: IndexesIcon },
      { name: 'Crash-Out Auditor', href: '/crash-out', icon: KeyIcon },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { name: 'BYOK API Keys', href: '/api-keys', icon: KeyIcon },
    ],
  },
]

export const footerNavigation: NavigationItem[] = [
  { name: 'Registration & Profile', href: '/register', icon: SettingsIcon },
]

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
