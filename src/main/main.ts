import { app, BrowserWindow, ipcMain, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { localServer } from './server.js'
import { sleepPrevention } from './power.js'
import { credentialVault } from './agent/vault.js'
import { agentTools } from './agent/tools.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null

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
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html')
    await mainWindow.loadFile(indexPath)
  }

  // By default, activate sleep prevention while app is active
  sleepPrevention.enable('Hermes Desktop Agent Running')

  mainWindow.on('closed', () => {
    mainWindow = null
    sleepPrevention.disable()
  })
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

app.whenReady().then(async () => {
  await createWindow()

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
