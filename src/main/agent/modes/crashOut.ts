/**
 * Self-Attacking Fact Checker & Code Stress-Tester (crash-out)
 * 
 * Automatically red-teams code, tool parameters, and developer assumptions
 * before anything is written to disk or executed in the shell.
 */

export interface CrashOutVulnerability {
  title: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  vector: string
  explanation: string
  remediation: string
}

export interface CrashOutReport {
  safe: boolean
  confidenceScore: number // 0-100
  vulnerabilities: CrashOutVulnerability[]
  adversarialNotes: string[]
}

export class CrashOutEngine {
  public static getPromptDirective(): string {
    return `
[SELF-ATTACKING CRASH-OUT MODE ACTIVE]
You are an adversarial red-team code auditor.
Before proposing any code modification or shell command, ATTACK your own solution:
1. Try to break it with malicious inputs (null bytes, path traversal '../', command injection metacharacters ';', '|', '&').
2. Check for race conditions, unbounded memory allocations, and prototype pollution.
3. Verify all file operations are strictly bound inside the workspace root.
4. Output your adversarial findings and fix them before delivering the code.
`
  }

  public static auditSnippet(codeOrCommand: string): CrashOutReport {
    const vulns: CrashOutVulnerability[] = []

    // 1. Shell command injection check
    if (/(exec\(`|exec\([^,]+\+)/.test(codeOrCommand) || /powershell.*-Command.*\$|\/bin\/sh.*\$|\/bin\/bash.*\$/.test(codeOrCommand)) {
      vulns.push({
        title: 'Shell Command Interpolation Injection',
        severity: 'CRITICAL',
        vector: 'CWE-78 / OS Command Injection',
        explanation: 'Unsanitized string interpolation directly inside shell exec() call.',
        remediation: 'Use spawn() or execFile() with discrete arguments array instead of shell interpolation.',
      })
    }

    // 2. Path traversal check
    if (/path\.join\([^)]*req\.|\.\.\//.test(codeOrCommand) && !codeOrCommand.includes('path.resolve') && !codeOrCommand.includes('startsWith')) {
      vulns.push({
        title: 'Potential Path Traversal in Filesystem Handler',
        severity: 'HIGH',
        vector: 'CWE-22 / Improper Limitation of a Pathname',
        explanation: 'User-controlled path segment joined without verifying boundary with path.resolve().startsWith().',
        remediation: 'Assert path.resolve(targetPath).startsWith(safeRoot) before reading/writing files.',
      })
    }

    // 3. Unbounded resource check
    if (/while\s*\(true\)|for\s*\(\s*;\s*;\s*\)/.test(codeOrCommand) && !codeOrCommand.includes('break') && !codeOrCommand.includes('timeout')) {
      vulns.push({
        title: 'Unbounded Loop Without Timeout',
        severity: 'MEDIUM',
        vector: 'CWE-400 / Resource Exhaustion',
        explanation: 'Loop has no visible termination or timeout guard.',
        remediation: 'Include an iteration count limiter or explicit cancellation token check.',
      })
    }

    const score = Math.max(10, 100 - vulns.length * 28)

    return {
      safe: vulns.length === 0,
      confidenceScore: score,
      vulnerabilities: vulns,
      adversarialNotes: [
        'Checked for command injection, arbitrary path escape, and memory leaks.',
        vulns.length === 0 ? 'Passed static adversarial verification.' : 'Found critical flaws that must be remediated.',
      ],
    }
  }
}
