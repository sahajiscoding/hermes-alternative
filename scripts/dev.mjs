import { createServer } from 'vite'
import { spawn } from 'child_process'
import electron from 'electron'

async function start() {
  const server = await createServer({
    configFile: './vite.config.ts',
    server: { port: 5173 },
  })

  await server.listen()
  console.log('[Dev] Vite Server running on http://localhost:5173')

  // Spawn tsc watch for electron main in parallel
  const electronProcess = spawn(electron, ['.'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
      NODE_ENV: 'development',
    },
  })

  electronProcess.on('close', () => {
    server.close()
    process.exit()
  })
}

start().catch(console.error)
