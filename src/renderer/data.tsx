import type { ComponentType, SVGProps } from 'react'
import {
  BillingIcon,
  DiscordIcon,
  DocsIcon,
  HomeIcon,
  IndexesIcon,
  KeyIcon,
  LogoutIcon,
  ProjectIcon,
  SettingsIcon,
} from './components/agndex/icons'

export type NavIcon = ComponentType<SVGProps<SVGSVGElement>>

export type NavigationItem = {
  name: string
  href: string
  icon: NavIcon
  external?: boolean
}

export type NavigationGroup = {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'General',
    items: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Agent Terminal', href: '/terminal', icon: IndexesIcon },
      { name: 'Mobile Companion', href: '/mobile-link', icon: ProjectIcon },
    ],
  },
  {
    label: 'Modes & Tournament',
    items: [
      { name: '6-Agent Tournament', href: '/tournament', icon: IndexesIcon },
      { name: 'Crash-Out Auditor', href: '/crash-out', icon: KeyIcon },
    ],
  },
  {
    label: 'Settings',
    items: [
      { name: 'API Keys (BYOK)', href: '/api-keys', icon: KeyIcon },
      { name: 'Billing & Quotas', href: '/billing', icon: BillingIcon },
    ],
  },
  {
    label: 'Support',
    items: [
      { name: 'Docs', href: '/docs', icon: DocsIcon },
      {
        name: 'Discord',
        href: 'https://discord.com',
        icon: DiscordIcon,
        external: true,
      },
    ],
  },
]

export const footerNavigation: NavigationItem[] = [
  { name: 'Settings', href: '/settings', icon: SettingsIcon },
]

export const logoutItem = {
  name: 'Logout',
  icon: LogoutIcon,
}

export const currentUser = {
  name: 'Vansh Patel',
  email: 'vansh@agndex.com',
  avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Vansh%20Patel',
  initials: 'VP',
}

export const projects = [
  { name: 'Hermes Workspace', id: 'default', path: 'c:\\Users\\kids\\Desktop\\Backup Folders\\sahaj ke programs\\hermes-alternative' },
  { name: 'Frontend Staging', id: 'staging', path: 'c:\\projects\\frontend-staging' },
  { name: 'Production Agent', id: 'production', path: 'c:\\projects\\production' },
] as const

export type Project = (typeof projects)[number]

export const initialIndexes = [
  {
    id: '1',
    name: 'codebase-symbols-v2',
    updatedAt: '3/16/2026',
    docs: 142,
    status: 'Ready',
  },
  {
    id: '2',
    name: 'api-specifications-index',
    updatedAt: '3/16/2026',
    docs: 55,
    status: 'Ready',
  },
  {
    id: '3',
    name: 'security-audit-rules',
    updatedAt: '3/16/2026',
    docs: 98,
    status: 'Active',
  },
]

export const projectCredentials = {
  projectId: 'hermes_c101d38e-0555-421b-be6d-5699ed27c9aa',
  projectKey: 'sk_live_hermes_demo_secret_key_12345',
}

export const projectSummary = {
  tier: 'Enterprise Developer',
  indexesUsed: 3,
  indexesLimit: 10,
}

export const subscription = {
  tier: 'Developer Tier (BYOK)',
  plan: 'Unlimited Local + Direct Provider Keys',
  billingCycle: 'Mar 1, 2026 - Mar 31, 2026',
}

export const usageStats = [
  { label: 'Agent Tasks Completed', value: '1,420', icon: ProjectIcon },
  { label: 'Active Indexes', value: '3', icon: IndexesIcon },
  { label: 'Mobile Sessions Synced', value: '87', icon: ProjectIcon },
] as const

export const resourceRows = [
  { resource: 'Local Shell Execution', included: 'Unlimited', overage: 'Included' },
  { resource: 'LAN Mobile Connections', included: 'Up to 5 devices', overage: 'Active' },
  { resource: 'Win32 Sleep Prevention', included: 'Native Continuous', overage: 'Active' },
  { resource: 'Six-Agent Tournament (67)', included: 'Parallel multi-eval', overage: 'Available' },
  { resource: 'Crash-Out Adversary', included: 'Red-team audit loop', overage: 'Active' },
] as const
