import fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
import fastifyStatic from '@fastify/static'
import os from 'os'
import path from 'path'
import fs from 'fs'
import { sleepPrevention } from './power.js'
import { agentTools } from './agent/tools.js'

export interface NetworkInterfaceInfo {
  name: string
  ip: string
  isPreferred: boolean
}

export interface RegisteredDevice {
  id: string
  name: string
  token: string
  pairedAt: string
  lastSeen: string
  ip?: string
  userAgent?: string
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
  private registeredDevices: Map<string, RegisteredDevice> = new Map()
  private wsClients: Set<any> = new Set()

  constructor(preferredPort: number = 4152) {
    this.port = preferredPort
    this.lanIp = getLocalIp()
    this.app = fastify({ logger: false })
  }

  public async start(): Promise<{ ip: string; port: number; pin: string }> {
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
      console.log(`[LocalServer] Sesori API & Mobile Server listening on http://${this.lanIp}:${this.port}`)
    } catch (err: any) {
      if (err.code === 'EADDRINUSE') {
        this.port += 1
        await this.app.listen({ port: this.port, host: '0.0.0.0' })
        console.log(`[LocalServer] Bound to fallback port http://${this.lanIp}:${this.port}`)
      } else {
        throw err
      }
    }

    return { ip: this.lanIp, port: this.port, pin: this.pairingPin }
  }

  private setupRoutes() {
    // Crucial: Handle asset requests from /mobile/assets/... as well as /assets/...
    this.app.get('/mobile/assets/*', async (req, reply) => {
      const assetPath = (req.params as any)['*']
      const filePath = path.resolve(process.cwd(), 'dist', 'assets', assetPath)
      if (fs.existsSync(filePath)) {
        return reply.sendFile(`assets/${assetPath}`)
      }
      return reply.status(404).send('Asset not found')
    })

    // Mobile SPA routes - serve index.html
    this.app.get('/mobile', async (req, reply) => {
      return reply.sendFile('index.html')
    })
    this.app.get('/mobile/', async (req, reply) => {
      return reply.sendFile('index.html')
    })
    this.app.get('/mobile/*', async (req, reply) => {
      return reply.sendFile('index.html')
    })

    // Network interfaces endpoint for dynamic client discovery
    this.app.get('/api/v1/network', async () => {
      return {
        primaryIp: this.lanIp,
        interfaces: getAllNetworkInterfaces(),
        port: this.port,
        pin: this.pairingPin,
      }
    })

    // Sesori Spec: Health & Host status
    this.app.get('/api/v1/health', async () => {
      return {
        status: 'ok',
        version: '1.0.0',
        lanIp: this.lanIp,
        port: this.port,
        pin: this.pairingPin,
        sleepPrevention: sleepPrevention.getStatus(),
        platform: process.platform,
        activeSessions: this.activeSessions.size,
        registeredDevices: Array.from(this.registeredDevices.values()),
      }
    })

    // PIN Rotation endpoint
    this.app.post('/api/v1/pin/rotate', async () => {
      this.pairingPin = Math.floor(100000 + Math.random() * 900000).toString()
      this.broadcast({ type: 'pin_rotated', pin: this.pairingPin })
      return { pin: this.pairingPin }
    })

    // Sesori Spec: Device Pairing & Registration
    this.app.post('/api/v1/devices/pair', async (req: any, reply) => {
      const { pin, deviceName } = req.body || {}
      if (pin === this.pairingPin) {
        const id = `dev_${Date.now()}`
        const token = `sesori_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        const device: RegisteredDevice = {
          id,
          name: deviceName || (req.headers['user-agent']?.includes('iPhone') ? 'iPhone Companion' : req.headers['user-agent']?.includes('Android') ? 'Android Companion' : 'Mobile Companion'),
          token,
          pairedAt: new Date().toISOString(),
          lastSeen: new Date().toISOString(),
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        }
        this.registeredDevices.set(id, device)

        // Automatically enable keep-awake when phone pairs
        sleepPrevention.enable(`Paired with mobile device: ${device.name}`)
        this.broadcast({ type: 'device_paired', device })

        return {
          success: true,
          token,
          device,
          message: 'Device successfully paired and registered',
        }
      }
      return reply.status(401).send({ success: false, error: 'Invalid PIN' })
    })

    // Get registered devices list
    this.app.get('/api/v1/devices', async () => {
      return Array.from(this.registeredDevices.values())
    })

    // Revoke device registration
    this.app.delete('/api/v1/devices/:id', async (req: any) => {
      const { id } = req.params
      const deleted = this.registeredDevices.delete(id)
      this.broadcast({ type: 'device_revoked', id })
      return { success: deleted }
    })

    // Sesori Spec: Sessions List & Create
    this.app.get('/api/v1/sessions', async () => {
      return Array.from(this.activeSessions.values())
    })

    this.app.post('/api/v1/sessions', async (req: any) => {
      const { model, mode, title } = req.body || {}
      const id = `ses_${Date.now()}`
      const session = {
        id,
        title: title || 'Mobile Agent Task',
        model: model || 'claude-3-7-sonnet',
        mode: mode || 'larp',
        status: 'idle',
        createdAt: new Date().toISOString(),
        messages: [],
      }
      this.activeSessions.set(id, session)
      return session
    })

    // Sesori Spec: Send Message / Prompt from Mobile
    this.app.post('/api/v1/sessions/:id/messages', async (req: any) => {
      const { id } = req.params
      const { content } = req.body || {}

      let session = this.activeSessions.get(id)
      if (!session) {
        session = { id, title: 'Mobile Agent Session', status: 'idle', messages: [] }
        this.activeSessions.set(id, session)
      }
      session.status = 'busy'
      sleepPrevention.enable('Agent task running from mobile')

      // Broadcast user message to WebSockets
      this.broadcast({
        type: 'message_start',
        sessionId: id,
        role: 'user',
        content,
      })

      // Execute tool or command on desktop
      setTimeout(async () => {
        let responseText = `Received command: "${content}".\nWorkspace: ${agentTools.getWorkspaceRoot()}`

        try {
          if (content.toLowerCase().startsWith('run ') || content.toLowerCase().startsWith('exec ')) {
            const cmd = content.replace(/^(run|exec)\s+/i, '')
            const res = await agentTools.runCommand(cmd)
            responseText += `\n\n[Executed: ${cmd}]\n${res.output || (res.error ? `Error: ${res.error}` : 'Success (No output)')}`
          } else if (content.toLowerCase().includes('status')) {
            const res = await agentTools.runCommand('git status --short')
            responseText += `\n\n[Git Status]:\n${res.output || 'Working directory clean.'}`
          } else if (content.toLowerCase().includes('list') || content.toLowerCase().includes('files')) {
            const res = agentTools.listDir('.')
            responseText += `\n\n[Workspace Files]:\n${res.output || 'Empty directory'}`
          } else {
            responseText += `\n\n[Agent Core]: Task queued and processed on Windows Desktop Host.`
          }
        } catch (e: any) {
          responseText += `\n\n[Error]: ${e.message}`
        }

        this.broadcast({
          type: 'message_complete',
          sessionId: id,
          role: 'agent',
          content: responseText,
        })
        session.status = 'idle'
      }, 300)

      return { success: true }
    })

    // Sleep Prevention Endpoints
    this.app.get('/api/v1/system/power', async () => {
      return sleepPrevention.getStatus()
    })

    this.app.post('/api/v1/system/power/toggle', async (req: any) => {
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
    this.app.get('/ws/agent-stream', { websocket: true }, (socket, req) => {
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
    return Array.from(this.registeredDevices.values())
  }

  public revokeDevice(id: string): boolean {
    const deleted = this.registeredDevices.delete(id)
    this.broadcast({ type: 'device_revoked', id })
    return deleted
  }

  public getNetworkInterfaces(): NetworkInterfaceInfo[] {
    return getAllNetworkInterfaces()
  }

  public getServerDetails() {
    return {
      ip: this.lanIp,
      port: this.port,
      pin: this.pairingPin,
      status: 'Online',
      registeredDevices: this.getRegisteredDevices(),
      interfaces: this.getNetworkInterfaces(),
    }
  }
}

export const localServer = new LocalAgentServer()
