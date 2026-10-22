import { useState, useEffect } from 'react'
import {
  AddIcon,
  CalendarIcon,
  DeleteIcon,
  DeveloperIcon,
  DocumentIcon,
  IndexesIcon,
  KeyIcon,
  ProjectIcon,
  SampleIcon,
} from './icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { initialIndexes, projectSummary, projects } from '../../data'
import { cn } from '@/lib/utils'
import { Smartphone, ShieldCheck, Flame, Cpu, Eye, Moon, Zap } from 'lucide-react'
import { useDashboardNavigation } from './navigation'

const metaChipClassName =
  'flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-3 text-muted-foreground text-xs md:justify-start md:px-3.5'

const defaultProject = projects[0]

export function DashboardPage() {
  const { navigate } = useDashboardNavigation()
  const [indexesList, setIndexesList] = useState(initialIndexes)
  const [sleepPrevention, setSleepPrevention] = useState(true)
  const [serverInfo, setServerInfo] = useState<{ ip: string; port: number; status: string }>({
    ip: '192.168.1.45',
    port: 4152,
    status: 'Online',
  })

  useEffect(() => {
    // If running inside Electron, fetch live server status
    if ((window as any).electron?.getServerInfo) {
      ;(window as any).electron.getServerInfo().then((info: any) => {
        if (info) setServerInfo(info)
      })
    }
  }, [])

  function toggleSleepPrevention() {
    const nextState = !sleepPrevention
    setSleepPrevention(nextState)
    if ((window as any).electron?.setSleepPrevention) {
      ;(window as any).electron.setSleepPrevention(nextState)
    }
  }

  function handleCreateIndex() {
    const name = prompt('Enter new index name:', `src-index-${Date.now().toString().slice(-4)}`)
    if (!name) return
    const newIdx = {
      id: Date.now().toString(),
      name,
      updatedAt: 'Just now',
      docs: Math.floor(Math.random() * 80) + 10,
      status: 'Active',
    }
    setIndexesList([newIdx, ...indexesList])
  }

  function handleDeleteIndex(id: string) {
    setIndexesList(indexesList.filter((idx) => idx.id !== id))
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-4 md:gap-10 md:p-8">
      {/* Header section */}
      <div className="flex flex-col md:gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Agent Control Center</h1>
        <p className="text-muted-foreground text-sm">
          Active Workspace: {defaultProject.name} — Monitor indexes, models, and remote mobile sessions
        </p>
      </div>

      {/* Status Bar */}
      <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap md:items-center md:justify-between">
        <div className="contents md:flex md:flex-wrap md:items-center md:gap-2">
          <div className={cn(metaChipClassName, 'font-medium text-foreground')}>
            <ProjectIcon />
            {defaultProject.name}
          </div>
          <div className={metaChipClassName}>
            <DeveloperIcon />
            {projectSummary.tier}
          </div>
          <div className={metaChipClassName}>
            <IndexesIcon />
            {indexesList.length} / 10 Indexes
          </div>
          <div
            onClick={toggleSleepPrevention}
            className={cn(
              metaChipClassName,
              'cursor-pointer transition-colors select-none',
              sleepPrevention
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-muted text-muted-foreground'
            )}
            title="Click to toggle Windows sleep prevention"
          >
            <Moon className="size-3.5" />
            <span>Sleep Prevention: {sleepPrevention ? 'ON' : 'OFF'}</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => navigate('/mobile-link')}
          className="h-10 gap-2 px-3 text-xs md:px-4 font-normal"
        >
          <Smartphone className="size-4 text-primary" />
          <span>Mobile: {serverInfo.ip}:{serverInfo.port}</span>
        </Button>
      </div>

      {/* Quick Action Engine Launchers */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Specialized Agent Execution Engines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => navigate('/terminal?mode=larp')}
            className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:bg-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Eye className="size-4 text-sky-500" />
                <span>Anti-Slop Mode (larp)</span>
              </div>
              <Badge variant="outline" className="text-xxs uppercase">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Forces clean, non-generic typography, Apple physical motion, and eliminates AI boilerplate design.
            </p>
          </div>

          <div
            onClick={() => navigate('/tournament')}
            className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:bg-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Zap className="size-4 text-amber-500" />
                <span>6-Agent Tournament (67)</span>
              </div>
              <Badge variant="outline" className="text-xxs uppercase">Multi-Eval</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Pits 6 internal agent personas in a round-robin tournament to vet and synthesize optimal solutions.
            </p>
          </div>

          <div
            onClick={() => navigate('/crash-out')}
            className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card hover:bg-card-hover transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Flame className="size-4 text-rose-500" />
                <span>Crash-Out Auditor</span>
              </div>
              <Badge variant="outline" className="text-xxs uppercase">Red-Team</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Self-attacking adversary that stresses code, input security, race conditions, and boundary flaws.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Search Indexes Section */}
      <div className="flex flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <IndexesIcon />
              <h2 className="font-medium text-base">Search & Codebase Indexes</h2>
              <Badge className="h-auto rounded-lg bg-info/10 py-1 font-normal text-info text-xs">
                {indexesList.length} Active Indexes
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground md:pl-7">
              Manage semantic and AST symbols for {defaultProject.name}
            </p>
          </div>

          <div className="flex flex-row items-center gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1 gap-2 px-3 text-xs font-normal md:w-auto md:flex-none"
              onClick={() => {
                const sampleIdx = {
                  id: Date.now().toString(),
                  name: `sample-ast-symbols-${indexesList.length + 1}`,
                  updatedAt: 'Just now',
                  docs: 64,
                  status: 'Ready',
                }
                setIndexesList([...indexesList, sampleIdx])
              }}
            >
              <SampleIcon />
              Create from sample
            </Button>
            <Button
              onClick={handleCreateIndex}
              className="h-10 flex-1 gap-2 px-3 text-xs font-normal md:w-auto md:flex-none"
            >
              <AddIcon />
              Create Index
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {indexesList.map((index) => (
            <div
              key={index.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-card-hover"
            >
              <div className="flex items-center gap-3 overflow-hidden md:gap-4">
                <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-sidebar text-muted-foreground">
                  <DocumentIcon />
                </div>
                <div className="flex flex-col gap-1 overflow-hidden">
                  <p className="truncate text-sm font-medium tracking-tight">{index.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon />
                      <span>Updated {index.updatedAt}</span>
                    </span>
                    <span className="size-1 rounded-full bg-muted-foreground" />
                    <span>{index.docs} symbols indexed</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  onClick={() => alert(`Index ${index.name} has ${index.docs} symbols ready.`)}
                >
                  <KeyIcon />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteIndex(index.id)}
                >
                  <DeleteIcon />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
