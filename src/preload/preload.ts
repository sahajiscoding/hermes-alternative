import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  getServerInfo: () => ipcRenderer.invoke('get-server-info'),
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  setPrimaryIp: (ip: string) => ipcRenderer.invoke('set-primary-ip', ip),
  rotatePin: () => ipcRenderer.invoke('rotate-pin'),
  getRegisteredDevices: () => ipcRenderer.invoke('get-registered-devices'),
  revokeDevice: (id: string) => ipcRenderer.invoke('revoke-device', id),
  setSleepPrevention: (enable: boolean) => ipcRenderer.invoke('set-sleep-prevention', enable),
  getSleepPrevention: () => ipcRenderer.invoke('get-sleep-prevention'),
  saveVaultKeys: (keys: Record<string, string>) => ipcRenderer.invoke('save-vault-keys', keys),
  loadVaultKeys: () => ipcRenderer.invoke('load-vault-keys'),
  runTool: (toolName: string, args: any) => ipcRenderer.invoke('run-tool', toolName, args),
  executeTerminal: (command: string) => ipcRenderer.invoke('execute-terminal', command),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onStreamChunk: (callback: (data: string) => void) => {
    const handler = (_event: any, chunk: string) => callback(chunk)
    ipcRenderer.on('terminal-chunk', handler)
    return () => ipcRenderer.removeListener('terminal-chunk', handler)
  },
  onUpdateStatus: (callback: (status: any) => void) => {
    const handler = (_event: any, status: any) => callback(status)
    ipcRenderer.on('update-status', handler)
    return () => ipcRenderer.removeListener('update-status', handler)
  },
  onUpdateDownloadProgress: (callback: (progress: any) => void) => {
    const handler = (_event: any, progress: any) => callback(progress)
    ipcRenderer.on('update-download-progress', handler)
    return () => ipcRenderer.removeListener('update-download-progress', handler)
  },
})
