import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import electronUpdater from 'electron-updater'
import { localServer } from './server.js'
import { sleepPrevention } from './power.js'
import { credentialVault } from './agent/vault.js'
import { agentTools } from './agent/tools.js'

const { autoUpdater } = electronUpdater as any

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null

/**
 * Locate the built renderer entry point.
 *
 * The compiled main process lives in `<app root>/dist-electron/main`, so the
 * renderer can be reached with `../../dist/index.html` in both dev and a
 * packaged asar. We still probe a couple of candidates and verify the file
 * exists, because a single wrong `..` used to leave the window completely
 * blank with no visible error.
 */
function resolveRendererIndex(): { file: string | null; looked: string[] } {
  const looked = [
    path.join(app.getAppPath(), 'dist', 'index.html'),
    path.join(__dirname, '..', '..', 'dist', 'index.html'),
  ]
  for (const candidate of looked) {
    if (fs.existsSync(candidate)) return { file: candidate, looked }
  }
  return { file: null, looked }
}

function buildErrorMessage(title: string, detail: string, looked: string[] = []): string {
  const lookedHtml = looked.length
    ? `<p>The app looked for the UI at:</p><pre>${looked.join('\n')}</pre>`
    : ''
  return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:40px;background:#090d16;color:#f8fafc;font-family:Segoe UI,system-ui,sans-serif;line-height:1.5">
  <h1 style="margin:0 0 12px;font-size:20px">${title}</h1>
  <p style="color:#94a3b8;max-width:70ch">${detail}</p>
  ${lookedHtml}
  <p style="color:#94a3b8">Try reinstalling the app, or run <code style="color:#22c55e">npm run build</code> then <code style="color:#22c55e">npm start</code> from the project folder.</p>
</body></html>`)}`
}


async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 880,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#090d16',
    title: 'Hermes Alternative',
    titleBarStyle: 'default',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      sandbox: false,
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Start the embedded local server (Sesori API + mobile companion)
  await localServer.start()

  // Load the built renderer or Vite dev server
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production'
  try {
    if (isDev && process.env.VITE_DEV_SERVER_URL) {
      await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    } else {
      const { file, looked } = resolveRendererIndex()
      if (!file) {
        const message = 'The application UI (dist/index.html) could not be found.'
        console.error(`[Renderer] ${message}\n${looked.join('\n')}`)
        await mainWindow.loadURL(buildErrorMessage('Hermes could not load its interface', message, looked))
        dialog.showErrorBox('Hermes could not start', `${message}\n\nSearched:\n${looked.join('\n')}`)
      } else {
        await mainWindow.loadFile(file)
      }
    }
  } catch (err: any) {
    const message = err?.message || String(err)
    console.error('[Renderer] Failed to load the interface:', err)
    try {
      await mainWindow.loadURL(
        buildErrorMessage('Hermes could not load its interface', message)
      )
    } catch {
      dialog.showErrorBox('Hermes could not start', message)
    }
  }

  // By default, activate sleep prevention while app is active
  sleepPrevention.enable('Hermes Desktop Agent Running')

  mainWindow.on('closed', () => {
    mainWindow = null
    sleepPrevention.disable()
  })
}

// Auto-updater setup
function setupAutoUpdater() {
  if (app.isPackaged) {
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    autoUpdater.on('checking-for-update', () => {
      mainWindow?.webContents.send('update-status', { status: 'checking' })
    })

    autoUpdater.on('update-available', (info: any) => {
      mainWindow?.webContents.send('update-status', { 
        status: 'available', 
        version: info.version,
        releaseNotes: info.releaseNotes 
      })
    })

    autoUpdater.on('update-not-available', () => {
      mainWindow?.webContents.send('update-status', { status: 'not-available' })
    })

    autoUpdater.on('error', (err: any) => {
      console.error('Auto-updater error:', err)
      mainWindow?.webContents.send('update-status', { 
        status: 'error', 
        error: err.message 
      })
    })

    autoUpdater.on('download-progress', (progress: any) => {
      mainWindow?.webContents.send('update-download-progress', progress)
    })

    autoUpdater.on('update-downloaded', (info: any) => {
      mainWindow?.webContents.send('update-status', { 
        status: 'downloaded', 
        version: info.version 
      })
    })

    // Check for updates on startup (after window loads)
    setTimeout(() => {
      autoUpdater.checkForUpdates()
    }, 3000)

    // Check for updates every 4 hours
    setInterval(() => {
      autoUpdater.checkForUpdates()
    }, 4 * 60 * 60 * 1000)
  }
}

// IPC Handlers
ipcMain.handle('get-server-info', async () => {
  return localServer.getServerDetails()
})

ipcMain.handle('get-network-interfaces', async () => {
  return localServer.getNetworkInterfaces()
})

ipcMain.handle('set-primary-ip', async (_event, ip: string) => {
  localServer.setLanIp(ip)
  return { success: true, ip }
})

ipcMain.handle('rotate-pin', async () => {
  const pin = localServer.rotatePin()
  return { pin }
})

ipcMain.handle('get-registered-devices', async () => {
  return localServer.getRegisteredDevices()
})

ipcMain.handle('revoke-device', async (_event, id: string) => {
  return localServer.revokeDevice(id)
})

ipcMain.handle('set-sleep-prevention', async (_event, enable: boolean) => {
  enable ? sleepPrevention.enable('User toggle in dashboard') : sleepPrevention.disable()
  return sleepPrevention.getStatus()
})

ipcMain.handle('get-sleep-prevention', async () => {
  return sleepPrevention.getStatus()
})

ipcMain.handle('save-vault-keys', async (_event, keys: Record<string, string>) => {
  credentialVault.saveKeys(keys)
  return { success: true }
})

ipcMain.handle('load-vault-keys', async () => {
  return credentialVault.loadKeys()
})

ipcMain.handle('run-tool', async (_event, toolName: string, args: any) => {
  switch (toolName) {
    case 'run_command':
      return await agentTools.runCommand(args.command)
    case 'read_file':
      return agentTools.readFile(args.path)
    case 'write_file':
      return agentTools.writeFile(args.path, args.content)
    case 'edit_file':
      return agentTools.editFile(args.path, args.target, args.replacement)
    case 'list_dir':
      return agentTools.listDir(args.path)
    default:
      return { success: false, output: '', error: `Unknown tool: ${toolName}` }
  }
})

ipcMain.handle('execute-terminal', async (_event, command: string) => {
  return await agentTools.runCommand(command, (chunk) => {
    mainWindow?.webContents.send('terminal-chunk', chunk)
  })
})

// Auto-updater IPC handlers
ipcMain.handle('check-for-updates', async () => {
  if (!app.isPackaged) return { success: false, error: 'Not available in development' }
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, updateInfo: result?.updateInfo }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('download-update', async () => {
  if (!app.isPackaged) return { success: false, error: 'Not available in development' }
  try {
    await autoUpdater.downloadUpdate()
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.handle('install-update', async () => {
  if (!app.isPackaged) return { success: false, error: 'Not available in development' }
  autoUpdater.quitAndInstall(true, true)
  return { success: true }
})

app.whenReady().then(async () => {
  await createWindow()
  setupAutoUpdater()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  sleepPrevention.disable()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
