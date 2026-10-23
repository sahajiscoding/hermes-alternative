import fastify, { FastifyInstance } from 'fastify'
import path from 'path'
import fs from 'fs'
import os from 'os'
import cors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
import fastifyStatic from '@fastify/static'
import { sleepPrevention } from './power.js'

export interface NetworkInterfaceInfo {
  name: string
  ip: string
  isPreferred: boolean
}

export interface RegisteredDevice {
  id: string
  name: string
}

export function getAllNetworkInterfaces(): NetworkInterfaceInfo[] {
  const interfaces = os.networkInterfaces()
  const list: NetworkInterfaceInfo[] = []
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        const isVirtual = /vethernet|virtual|wsl|hyper-v|vmware|tailscale|loopback/i.test(name)
        const isPreferred = /wi-?fi|wlan|ethernet/i.test(name) && !isVirtual
        list.push({
          name,
          ip: iface.address,
          isPreferred,
        })
      }
    }
  }
  // Sort so preferred interfaces come first
  list.sort((a, b) => (b.isPreferred ? 1 : 0) - (a.isPreferred ? 1 : 0))
  return list
}

export function getLocalIp(): string {
  const ifaces = getAllNetworkInterfaces()
  if (ifaces.length > 0) {
    return ifaces[0].ip
  }
  return '127.0.0.1'
}

export class LocalAgentServer {
  private app: FastifyInstance
  private port: number = 4152
  private lanIp: string
  private pairingPin: string = '742819'
  private activeSessions: Map<string, any> = new Map()
  private wsClients: Set<any> = new Set()

  constructor(preferredPort: number = 4152) {
    this.port = preferredPort
    this.lanIp = getLocalIp()
    this.app = fastify({ logger: false })
  }

  public async start(): Promise<{ ip: string; port: number }> {
    await this.app.register(cors, { origin: true })
    await this.app.register(fastifyWebsocket)

    // Serve pre-built renderer for mobile devices accessing http://192.168.x.x:4152/mobile
    const distPath = path.resolve(process.cwd(), 'dist')
    if (distPath && fs.existsSync(distPath)) {
      await this.app.register(fastifyStatic, {
        root: distPath,
        prefix: '/',
        wildcard: true,
      })
    }

    this.setupRoutes()

    try {
      await this.app.listen({ port: this.port, host: '0.0.0.0' })
      console.log(`[LocalServer] Hermes API Server listening on http://${this.lanIp}:${this.port}`)
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        this.port += 1
        await this.app.listen({ port: this.port, host: '0.0.0.0' })
        console.log(`[LocalServer] Bound to fallback port http://${this.lanIp}:${this.port}`)
      } else {
        throw err
      }
    }

    return { ip: this.lanIp, port: this.port }
  }

  private setupRoutes() {
    // Handle asset requests from /mobile/assets/... as well as /assets/...
    this.app.get('/mobile/assets/*', async (req: any, reply: any) => {
      const assetPath = (req.params as any)['*']
      const filePath = path.resolve(process.cwd(), 'dist', 'assets', assetPath)
      if (fs.existsSync(filePath)) {
        return reply.sendFile(`assets/${assetPath}`)
      }
      return reply.status(404).send('Asset not found')
    })

    // Mobile SPA routes - serve index.html
    this.app.get('/mobile', async (_req: any, reply: any) => {
      return reply.sendFile('index.html')
    })
    this.app.get('/mobile/', async (_req: any, reply: any) => {
      return reply.sendFile('index.html')
    })
    this.app.get('/mobile/*', async (_req: any, reply: any) => {
      return reply.sendFile('index.html')
    })

    // Health endpoint
    this.app.get('/api/v1/health', async () => {
      return {
        status: 'ok',
        version: '1.0.0',
        lanIp: this.lanIp,
        port: this.port,
        sleepPrevention: sleepPrevention.getStatus().isEnabled,
        platform: process.platform,
        activeSessions: this.activeSessions.size,
      }
    })

    // Sleep Prevention Endpoints
    this.app.get('/api/v1/system/power', async () => {
      return sleepPrevention.getStatus()
    })

    this.app.post('/api/v1/system/power/toggle', async (req: any, _reply: any) => {
      const { enable } = req.body || {}
      if (enable !== undefined) {
        enable ? sleepPrevention.enable('Manual toggle') : sleepPrevention.disable()
      } else {
        const cur = sleepPrevention.getStatus().isEnabled
        cur ? sleepPrevention.disable() : sleepPrevention.enable('Manual toggle')
      }
      const status = sleepPrevention.getStatus()
      this.broadcast({ type: 'power_status', status })
      return status
    })

    // WebSocket real-time agent output streaming
    this.app.get('/ws/agent-stream', { websocket: true }, (socket: any, req: any) => {
      this.wsClients.add(socket)
      socket.send(JSON.stringify({
        type: 'connected',
        lanIp: this.lanIp,
        sleepPrevention: sleepPrevention.getStatus().isEnabled,
      }))

      socket.on('close', () => {
        this.wsClients.delete(socket)
      })
    })
  }

  public broadcast(data: any) {
    const payload = JSON.stringify(data)
    for (const client of this.wsClients) {
      try {
        client.send(payload)
      } catch (e) {}
    }
  }

  public setLanIp(newIp: string) {
    this.lanIp = newIp
    console.log(`[LocalServer] Primary LAN IP updated to ${newIp}`)
  }

  public rotatePin(): string {
    this.pairingPin = Math.floor(100000 + Math.random() * 900000).toString()
    this.broadcast({ type: 'pin_rotated', pin: this.pairingPin })
    return this.pairingPin
  }

  public getRegisteredDevices(): RegisteredDevice[] {
    return []
  }

  public revokeDevice(id: string): boolean {
    return false
  }

  public getNetworkInterfaces(): NetworkInterfaceInfo[] {
    return getAllNetworkInterfaces()
  }

  public getServerDetails() {
    return {
      ip: this.lanIp,
      port: this.port,
      status: 'Online',
      interfaces: this.getNetworkInterfaces(),
    }
  }
}

export const localServer = new LocalAgentServer()
