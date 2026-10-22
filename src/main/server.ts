import fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import fastifyWebsocket from '@fastify/websocket'
import fastifyStatic from '@fastify/static'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'
import { sleepPrevention } from './power.js'
import { agentTools } from './agent/tools.js'
import { credentialVault } from './agent/vault.js'
import { CrashOutEngine } from './agent/modes/crashOut.js'
import { TournamentEngine } from './agent/modes/tournament.js'
import { LarpEngine } from './agent/modes/larp.js'

function getLocalIp(): string {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address
      }
    }
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

  public async start(): Promise<{ ip: string; port: number; pin: string }> {
    await this.app.register(cors, { origin: true })
    await this.app.register(fastifyWebsocket)

    // Serve pre-built renderer for mobile devices accessing http://192.168.x.x:4152/mobile
    const distPath = path.resolve(process.cwd(), 'dist')
    if (distPath) {
      await this.app.register(fastifyStatic, {
        root: distPath,
        prefix: '/',
        wildcard: false,
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
    // Mobile route redirect / SPA handler
    this.app.get('/mobile', async (req, reply) => {
      return reply.sendFile('index.html')
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
      }
    })

    // Sesori Spec: Device Pairing
    this.app.post('/api/v1/devices/pair', async (req: any, reply) => {
      const { pin, deviceName } = req.body || {}
      if (pin === this.pairingPin) {
        // Automatically enable keep-awake when phone pairs
        sleepPrevention.enable(`Paired with mobile device: ${deviceName || 'Phone'}`)
        return {
          success: true,
          token: `sesori_token_${Date.now()}`,
          message: 'Device successfully paired',
        }
      }
      return reply.status(401).send({ success: false, error: 'Invalid PIN' })
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

    // Sesori Spec: Send Message / Prompt
    this.app.post('/api/v1/sessions/:id/messages', async (req: any) => {
      const { id } = req.params
      const { content } = req.body || {}

      const session = this.activeSessions.get(id) || { id, messages: [] }
      session.status = 'busy'
      sleepPrevention.enable('Agent task running from mobile')

      // Broadcast to WebSockets
      this.broadcast({
        type: 'message_start',
        sessionId: id,
        role: 'user',
        content,
      })

      // Run tools in background
      setTimeout(async () => {
        let responseText = `Received command: "${content}".\nWorkspace: ${agentTools.getWorkspaceRoot()}`

        // If command includes git status or list
        if (content.toLowerCase().includes('status')) {
          const res = await agentTools.runCommand('git status')
          responseText += `\n\n[Git Status Output]:\n${res.output}`
        }

        this.broadcast({
          type: 'message_complete',
          sessionId: id,
          role: 'agent',
          content: responseText,
        })
        session.status = 'idle'
      }, 500)

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
      return sleepPrevention.getStatus()
    })

    // WebSocket real-time agent output streaming
    this.app.get('/ws/agent-stream', { websocket: true }, (socket, req) => {
      this.wsClients.add(socket)
      socket.send(JSON.stringify({ type: 'connected', lanIp: this.lanIp }))

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

  public getServerDetails() {
    return {
      ip: this.lanIp,
      port: this.port,
      pin: this.pairingPin,
      status: 'Online',
    }
  }
}

export const localServer = new LocalAgentServer()
