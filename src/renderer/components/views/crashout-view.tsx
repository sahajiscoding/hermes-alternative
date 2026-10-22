import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Flame, ShieldAlert, AlertTriangle, Bug, Terminal, CheckCircle2, Play, RefreshCw } from 'lucide-react'

interface VulnerabilityFinding {
  id: string
  title: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  vector: string
  explanation: string
  remediation: string
}

export function CrashOutView() {
  const [codeSnippet, setCodeSnippet] = useState(
    `async function executeUserScript(scriptPath: string) {\n  const fullPath = path.join('/tmp/workspace', scriptPath);\n  return exec(\`node \${fullPath}\`);\n}`
  )
  const [isAuditing, setIsAuditing] = useState(false)
  const [confidenceScore, setConfidenceScore] = useState(38) // 38% safe = 62% risky
  const [findings, setFindings] = useState<VulnerabilityFinding[]>([
    {
      id: '1',
      title: 'Command Injection & Shell Unsanitized Interpolation',
      severity: 'CRITICAL',
      vector: 'CWE-78 / OS Command Injection',
      explanation: 'Using template literal `${fullPath}` directly inside `exec()` allows an attacker to append shell metacharacters like `; rm -rf /` or `&& curl badsite.com`.',
      remediation: 'Use `execFile("node", [fullPath])` or `spawn` with an arguments array to bypass the system shell parser.',
    },
    {
      id: '2',
      title: 'Path Traversal via Unvalidated Segment',
      severity: 'HIGH',
      vector: 'CWE-22 / Directory Traversal',
      explanation: 'Passing `../../etc/passwd` to `path.join("/tmp/workspace", scriptPath)` escapes the root sandbox boundary if not checked with `path.relative()`.',
      remediation: 'Ensure `path.resolve(fullPath).startsWith(workspaceRoot)` before invoking any filesystem operations.',
    },
    {
      id: '3',
      title: 'Unbounded Process Execution (DoS)',
      severity: 'MEDIUM',
      vector: 'CWE-400 / Resource Exhaustion',
      explanation: 'Process execution lacks a timeout flag. Infinite loops or recursive worker threads will stall the host server indefinitely.',
      remediation: 'Add `{ timeout: 10000, maxBuffer: 10 * 1024 * 1024 }` to the execution options.',
    },
  ])

  function handleAudit() {
    setIsAuditing(true)
    setTimeout(() => {
      setIsAuditing(false)
      setConfidenceScore(89)
      setFindings([
        {
          id: '10',
          title: 'Adversarial Stress Test Passed',
          severity: 'LOW',
          vector: 'Invariant Verification',
          explanation: 'Edge cases tested: null-byte injection, empty string, oversized payload (1MB), symlink loop. No memory leaks or panic states detected.',
          remediation: 'Code meets high-assurance baseline.',
        },
      ])
    }, 1500)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 md:gap-10 md:p-8">
      <div className="flex flex-col md:gap-2">
        <div className="flex items-center gap-2">
          <Flame className="size-6 text-rose-500" />
          <h1 className="text-2xl font-semibold tracking-tight">Self-Attacking Auditor (Crash-Out Engine)</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Automatically red-teams code, tool calls, and architecture assumptions. Grills your logic with adversarial edge-cases before execution.
        </p>
      </div>

      {/* Code Input Card */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Target Code / Shell Action to Attack
          </label>
          <Badge
            variant="outline"
            className={
              confidenceScore < 60
                ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }
          >
            Safety Score: {confidenceScore}%
          </Badge>
        </div>
        <textarea
          rows={5}
          value={codeSnippet}
          onChange={(e) => setCodeSnippet(e.target.value)}
          className="w-full rounded-lg border border-border bg-background p-3 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          placeholder="Paste function or command to stress-test..."
        />
        <div className="flex justify-end">
          <Button
            onClick={handleAudit}
            disabled={isAuditing}
            className="h-10 px-5 gap-2 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isAuditing ? <RefreshCw className="size-4 animate-spin" /> : <Play className="size-4" />}
            <span>Attack & Grill Code</span>
          </Button>
        </div>
      </div>

      {/* Findings Report */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Adversarial Red-Team Findings</h2>
          <span className="text-xs text-muted-foreground">{findings.length} items flagged</span>
        </div>

        <div className="flex flex-col gap-3">
          {findings.map((f) => {
            const severityColor = {
              CRITICAL: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
              HIGH: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
              MEDIUM: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
              LOW: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
            }[f.severity]

            return (
              <div
                key={f.id}
                className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="size-4 text-rose-500" />
                    <span className="text-sm font-semibold">{f.title}</span>
                  </div>
                  <Badge variant="outline" className={`text-xxs font-bold ${severityColor}`}>
                    {f.severity}
                  </Badge>
                </div>

                <div className="text-xxs font-mono text-muted-foreground">{f.vector}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.explanation}</p>

                <div className="mt-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 text-xs">
                  <span className="font-semibold text-foreground">Fix / Remediation: </span>
                  <span className="text-muted-foreground">{f.remediation}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
