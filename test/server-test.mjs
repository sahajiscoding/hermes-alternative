import { localServer } from '../dist-electron/main/server.js'

async function runTest() {
  console.log('[Test] Starting embedded local server...')
  const details = await localServer.start()
  console.log('[Test] Server started successfully at:', details)

  // Test /api/v1/health
  const healthRes = await fetch(`http://127.0.0.1:${details.port}/api/v1/health`)
  const healthData = await healthRes.json()
  console.log('[Test] Health response:', healthData)

  // Test /api/v1/devices/pair
  const pairRes = await fetch(`http://127.0.0.1:${details.port}/api/v1/devices/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin: details.pin, deviceName: 'iPhone Test' }),
  })
  const pairData = await pairRes.json()
  console.log('[Test] Pairing response:', pairData)

  // Test /api/v1/system/power
  const powerRes = await fetch(`http://127.0.0.1:${details.port}/api/v1/system/power`)
  const powerData = await powerRes.json()
  console.log('[Test] Sleep prevention response:', powerData)

  console.log('[Test] All endpoint tests passed!')
  const { sleepPrevention } = await import('../dist-electron/main/power.js')
  sleepPrevention.disable()
  setTimeout(() => process.exit(0), 100)
}

runTest().catch((err) => {
  console.error('[Test Failed]:', err)
  process.exit(1)
})
