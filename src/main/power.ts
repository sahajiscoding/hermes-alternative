import { spawn, type ChildProcess } from 'child_process'

/**
 * Windows Win32 Sleep Prevention (Keep-Awake Engine)
 * Calls SetThreadExecutionState via PowerShell P/Invoke
 * 
 * Flags:
 * ES_CONTINUOUS        = 0x80000000
 * ES_SYSTEM_REQUIRED   = 0x00000001
 * ES_AWAYMODE_REQUIRED = 0x00000040
 */

class SleepPreventionManager {
  private isEnabled: boolean = false
  private workerProcess: ChildProcess | null = null

  public enable(reason: string = 'Hermes Agent Active'): boolean {
    if (this.isEnabled) return true

    if (process.platform === 'win32') {
      try {
        // Launch a persistent background script calling SetThreadExecutionState every 30 seconds
        const script = `
Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class Win32Power {
    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    public static extern uint SetThreadExecutionState(uint esFlags);
}
"@
while ($true) {
    [Win32Power]::SetThreadExecutionState(0x80000001 -bor 0x00000040) | Out-Null
    Start-Sleep -Seconds 30
}
`
        this.workerProcess = spawn('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
          windowsHide: true,
          stdio: 'ignore',
        })

        this.workerProcess.on('error', (err) => {
          console.error('[SleepPrevention] Worker process error:', err)
        })

        this.isEnabled = true
        console.log(`[SleepPrevention] Activated: ${reason}`)
        return true
      } catch (err) {
        console.error('[SleepPrevention] Failed to activate:', err)
        return false
      }
    } else {
      console.log(`[SleepPrevention] Non-windows platform (${process.platform}), no-op.`)
      this.isEnabled = true
      return true
    }
  }

  public disable(): boolean {
    if (!this.isEnabled) return true

    if (this.workerProcess) {
      try {
        this.workerProcess.kill('SIGTERM')
        this.workerProcess = null
      } catch (e) {
        // Ignore kill errors
      }
    }

    if (process.platform === 'win32') {
      try {
        // Reset execution state to ES_CONTINUOUS
        spawn('powershell.exe', [
          '-NoProfile',
          '-NonInteractive',
          '-Command',
          `Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public class P { [DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint f); }'; [P]::SetThreadExecutionState(0x80000000) | Out-Null`,
        ], { windowsHide: true, stdio: 'ignore' })
      } catch (err) {
        console.error('[SleepPrevention] Reset error:', err)
      }
    }

    this.isEnabled = false
    console.log('[SleepPrevention] Deactivated. System sleep restored.')
    return true
  }

  public getStatus(): { isEnabled: boolean } {
    return { isEnabled: this.isEnabled }
  }
}

export const sleepPrevention = new SleepPreventionManager()
