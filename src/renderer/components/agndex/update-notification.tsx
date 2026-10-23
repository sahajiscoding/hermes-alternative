import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { DownloadIcon, AlertCircleIcon as AlertCircle, CheckCircleIcon as CheckCircle, XCircleIcon as XCircle, Loader2Icon as Loader2 } from './icons'

type UpdateStatus = 
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'available'; version: string; releaseNotes?: string }
  | { status: 'not-available' }
  | { status: 'error'; error: string }
  | { status: 'downloading'; progress: number }
  | { status: 'downloaded'; version: string }

export function UpdateNotification() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ status: 'idle' })
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (!(window as any).electron?.ipcRenderer) return

    const handleStatus = (_: any, status: UpdateStatus) => {
      setUpdateStatus(status)
      if (status.status === 'available' || status.status === 'downloaded') {
        setShowDetails(true)
      }
    }

    const handleProgress = (_: any, progress: { percent: number; bytesPerSecond: number; total: number; transferred: number }) => {
      setUpdateStatus({ status: 'downloading', progress: Math.round(progress.percent) })
      setShowDetails(true)
    }

    ;(window as any).electron.ipcRenderer.on('update-status', handleStatus)
    ;(window as any).electron.ipcRenderer.on('update-download-progress', handleProgress)

    return () => {
      ;(window as any).electron.ipcRenderer.off('update-status', handleStatus)
      ;(window as any).electron.ipcRenderer.off('update-download-progress', handleProgress)
    }
  }, [])

  const checkForUpdates = async () => {
    setUpdateStatus({ status: 'checking' })
    try {
      const result = await (window as any).electron.ipcRenderer.invoke('check-for-updates')
      if (!result.success) {
        setUpdateStatus({ status: 'error', error: result.error })
      }
    } catch (err: any) {
      setUpdateStatus({ status: 'error', error: err.message })
    }
  }

  const downloadUpdate = async () => {
    try {
      const result = await (window as any).electron.ipcRenderer.invoke('download-update')
      if (!result.success) {
        setUpdateStatus({ status: 'error', error: result.error })
      }
    } catch (err: any) {
      setUpdateStatus({ status: 'error', error: err.message })
    }
  }

  const installUpdate = async () => {
    await (window as any).electron.ipcRenderer.invoke('install-update')
  }

  const dismiss = () => {
    setShowDetails(false)
    setUpdateStatus({ status: 'idle' })
  }

  if (updateStatus.status === 'idle' && !showDetails) {
    return null
  }

  if (updateStatus.status === 'checking') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-neutral-900 dark:bg-neutral-950 border border-neutral-700 rounded-xl p-4 shadow-xl min-w-[320px] flex items-center gap-3">
          <Loader2 className="size-5 text-primary animate-spin" />
          <span className="text-sm font-medium">Checking for updates...</span>
        </div>
      </div>
    )
  }

  if (updateStatus.status === 'available') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-neutral-900 dark:bg-neutral-950 border border-emerald-500/30 rounded-xl p-4 shadow-xl min-w-[320px] max-w-md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Update Available</p>
                <p className="text-sm text-muted-foreground">Version {updateStatus.version} is ready</p>
              </div>
            </div>
            <button onClick={dismiss} className="text-muted-foreground hover:text-foreground">
              <XCircle className="size-5" />
            </button>
          </div>

          {updateStatus.releaseNotes && showDetails && (
            <div className="mt-3 p-3 bg-neutral-800/50 rounded-lg border border-neutral-700 text-sm text-muted-foreground max-h-40 overflow-y-auto">
              {updateStatus.releaseNotes}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <Button onClick={downloadUpdate} className="flex-1" size="sm">
              <DownloadIcon className="size-4 mr-2" />
              Download Update
            </Button>
            <Button variant="ghost" onClick={dismiss} size="sm">
              Later
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (updateStatus.status === 'downloading') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-neutral-900 dark:bg-neutral-950 border border-primary/30 rounded-xl p-4 shadow-xl min-w-[320px]">
          <div className="flex items-center gap-3 mb-3">
            <Loader2 className="size-5 text-primary animate-spin" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Downloading Update</p>
              <p className="text-sm text-muted-foreground">{updateStatus.progress}%</p>
            </div>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${updateStatus.progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  if (updateStatus.status === 'downloaded') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-neutral-900 dark:bg-neutral-950 border border-emerald-500/30 rounded-xl p-4 shadow-xl min-w-[320px]">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="size-5 text-emerald-500" />
            <div>
              <p className="font-semibold text-foreground">Update Ready</p>
              <p className="text-sm text-muted-foreground">Version {updateStatus.version} downloaded</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={installUpdate} className="flex-1" size="sm">
              <AlertCircle className="size-4 mr-2" />
              Install & Restart
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (updateStatus.status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-neutral-900 dark:bg-neutral-950 border border-red-500/30 rounded-xl p-4 shadow-xl min-w-[320px]">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="size-5 text-red-500" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Update Error</p>
              <p className="text-sm text-muted-foreground">{updateStatus.error}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={checkForUpdates} size="sm">
              <Loader2 className="size-4 mr-2" />
              Retry
            </Button>
            <Button variant="ghost" onClick={dismiss} size="sm">
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (updateStatus.status === 'not-available') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-neutral-900 dark:bg-neutral-950 border border-neutral-700 rounded-xl p-4 shadow-xl min-w-[320px]">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="size-5 text-emerald-500" />
            <div className="flex-1">
              <p className="font-semibold text-foreground">Up to Date</p>
              <p className="text-sm text-muted-foreground">You're running the latest version</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={dismiss} size="sm">
              OK
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}