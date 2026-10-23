import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDashboardNavigation } from './navigation'
import { DownloadIcon, DeveloperIcon } from './icons'

interface ActivityItem {
  id: string
  timestamp: string
  title: string
  type: 'system' | 'mobile' | 'agent' | 'terminal'
  status: 'success' | 'running' | 'idle'
}

export function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* App Download Section */}
      <div className="flex flex-col items-center text-center pb-8 border-b border-border">
        <div className="size-20 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-4">
          <DeveloperIcon className="size-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Download Hermes Alternative
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Get the desktop app for Windows to access all agent features.
        </p>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <button
          className="flex items-center gap-2 rounded-xl bg-primary text-white px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          <DownloadIcon className="size-4" />
          <span>Windows .exe Installer</span>
        </button>
        <button
          className="flex items-center gap-2 rounded-xl bg-secondary text-white px-6 py-3 font-medium hover:bg-secondary/90 transition-colors"
        >
          <DownloadIcon className="size-4" />
          <span>Portable .zip</span>
        </button>
      </div>

      {/* Quick Links */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <p className="text-sm text-muted-foreground">
          Need help getting started? Visit our <a href="https://github.com/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">GitHub</a> for documentation.
        </p>
        <p className="text-xs text-muted-foreground">
          Hermes Alternative • Local-First Desktop Coding Agent
        </p>
      </div>
    </div>
  )
}
