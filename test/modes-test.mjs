import { LarpEngine } from '../dist-electron/main/agent/modes/larp.js'
import { TournamentEngine } from '../dist-electron/main/agent/modes/tournament.js'
import { CrashOutEngine } from '../dist-electron/main/agent/modes/crashOut.js'

async function runModesTest() {
  console.log('--- Testing Anti-Slop (larp) Engine ---')
  const slopSample = '<div className="rounded-xl bg-card uppercase tracking-wider">🚀 Hello world!</div>'
  const lintResult = LarpEngine.lintCode(slopSample)
  console.log('Larp Lint Result on Slop:', lintResult)
  if (lintResult.violations.length >= 2) {
    console.log('✓ Larp caught AI slop clichés successfully.')
  } else {
    throw new Error('Larp failed to detect slop.')
  }

  console.log('\n--- Testing Six-Agent Tournament (67) Engine ---')
  const tournamentResult = await TournamentEngine.runTournament('Build high-throughput queue')
  console.log(`Tournament Winner: ${tournamentResult.winner} with score ${tournamentResult.compositeScore}`)
  console.log(`Evaluated ${tournamentResult.evaluations.length} distinct agent personas.`)
  if (tournamentResult.evaluations.length === 6) {
    console.log('✓ 6-agent tournament executed with 6 distinct candidate evaluations.')
  } else {
    throw new Error('Tournament did not evaluate 6 personas.')
  }

  console.log('\n--- Testing Crash-Out (Adversarial Auditor) Engine ---')
  const dangerousCommand = 'exec(`node ${userInputScript}`)'
  const auditResult = CrashOutEngine.auditSnippet(dangerousCommand)
  console.log('Crash-Out Audit Result:', auditResult)
  if (auditResult.vulnerabilities.some(v => v.severity === 'CRITICAL')) {
    console.log('✓ Crash-out caught command injection vulnerability.')
  } else {
    throw new Error('Crash-out failed to detect injection.')
  }

  console.log('\nAll specialized agent mode tests passed successfully!')
  process.exit(0)
}

runModesTest().catch((err) => {
  console.error('[Modes Test Failed]:', err)
  process.exit(1)
})
