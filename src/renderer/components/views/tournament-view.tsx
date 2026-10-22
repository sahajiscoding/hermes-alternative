import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Zap, Trophy, Shield, Cpu, Sparkles, CheckCircle2, Play, RefreshCw } from 'lucide-react'

interface CandidateAgent {
  id: string
  name: string
  role: string
  icon: any
  score: number
  codeSummary: string
  verdict: 'winner' | 'runner-up' | 'evaluated'
  metrics: {
    cleanliness: number
    security: number
    performance: number
    robustness: number
  }
}

export function TournamentView() {
  const [taskPrompt, setTaskPrompt] = useState('Build a performant LRU Cache with TTL expiry and zero dependencies')
  const [isCompeting, setIsCompeting] = useState(false)
  const [agents, setAgents] = useState<CandidateAgent[]>([
    {
      id: '1',
      name: 'Agent Alpha (Minimalist)',
      role: 'Zero-Abstraction Architecture',
      icon: Cpu,
      score: 94,
      verdict: 'winner',
      codeSummary: 'Uses native Map iterator with O(1) delete/re-insert and precise interval sweep. 28 lines total.',
      metrics: { cleanliness: 98, security: 92, performance: 95, robustness: 91 },
    },
    {
      id: '2',
      name: 'Agent Beta (Sentinel)',
      role: 'OWASP & Strict Safety',
      icon: Shield,
      score: 91,
      verdict: 'runner-up',
      codeSummary: 'Includes bounds-checking, prototype pollution protection, and immutable read snapshots.',
      metrics: { cleanliness: 86, security: 99, performance: 88, robustness: 92 },
    },
    {
      id: '3',
      name: 'Agent Gamma (Speed Demon)',
      role: 'Sub-millisecond Latency',
      icon: Zap,
      score: 89,
      verdict: 'evaluated',
      codeSummary: 'Doubly linked list with pre-allocated buffer nodes for maximum throughput under heavy load.',
      metrics: { cleanliness: 80, security: 84, performance: 99, robustness: 88 },
    },
    {
      id: '4',
      name: 'Agent Delta (Polish)',
      role: 'Developer Experience & Ergonomics',
      icon: Sparkles,
      score: 87,
      verdict: 'evaluated',
      codeSummary: 'TypeScript generic types with event emitter hooks on eviction and expiration.',
      metrics: { cleanliness: 94, security: 86, performance: 82, robustness: 86 },
    },
    {
      id: '5',
      name: 'Agent Epsilon (Adversary)',
      role: 'Edge-Case & OOM Hunter',
      icon: Trophy,
      score: 90,
      verdict: 'evaluated',
      codeSummary: 'Strict memory-budget enforcement with automatic disposal callbacks to prevent V8 leaks.',
      metrics: { cleanliness: 88, security: 91, performance: 87, robustness: 96 },
    },
    {
      id: '6',
      name: 'Agent Zeta (Synthesizer)',
      role: 'Consensus Builder',
      icon: CheckCircle2,
      score: 96,
      verdict: 'winner',
      codeSummary: 'Synthesized implementation: Map O(1) speed from Alpha + bounds checks from Beta + memory leak protection from Epsilon.',
      metrics: { cleanliness: 96, security: 97, performance: 95, robustness: 96 },
    },
  ])

  function runTournament() {
    setIsCompeting(true)
    setTimeout(() => {
      setIsCompeting(false)
      // Slight re-scoring simulation
      setAgents((prev) =>
        prev.map((a) => ({
          ...a,
          score: Math.min(99, a.score + (Math.floor(Math.random() * 5) - 2)),
        }))
      )
    }, 1500)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-4 md:gap-10 md:p-8">
      <div className="flex flex-col md:gap-2">
        <div className="flex items-center gap-2">
          <Zap className="size-6 text-amber-500" />
          <h1 className="text-2xl font-semibold tracking-tight">Six-Agent Tournament (67 Engine)</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Pits 6 specialized internal agent personas against each other in real-time to propose, debate, and synthesize the ultimate code solution.
        </p>
      </div>

      {/* Task input card */}
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-card">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Competitive Tournament Prompt
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            className="flex-1 h-11 rounded-lg border border-border bg-background px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Describe problem or feature to tournament-test..."
          />
          <Button
            onClick={runTournament}
            disabled={isCompeting}
            className="h-11 px-5 gap-2 font-medium bg-amber-500 hover:bg-amber-600 text-black"
          >
            {isCompeting ? <RefreshCw className="size-4 animate-spin" /> : <Play className="size-4" />}
            <span>Run Tournament</span>
          </Button>
        </div>
      </div>

      {/* Leaderboard grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium">Contenders & Leaderboard</h2>
          <Badge variant="outline" className="text-xs">
            6 PERSONAS ACTIVE
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((ag) => {
            const Icon = ag.icon
            return (
              <div
                key={ag.id}
                className={`flex flex-col gap-3 p-5 rounded-xl border transition-all ${
                  ag.verdict === 'winner'
                    ? 'border-amber-500/40 bg-amber-500/5 shadow-xs'
                    : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-secondary flex items-center justify-center text-foreground">
                      <Icon className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{ag.name}</span>
                      <span className="text-xxs text-muted-foreground">{ag.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ag.verdict === 'winner' && (
                      <Badge className="bg-amber-500 text-black text-xxs font-bold">
                        WINNER
                      </Badge>
                    )}
                    <span className="text-lg font-mono font-bold">{ag.score}</span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                  {ag.codeSummary}
                </p>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-border/40 text-center">
                  <div>
                    <span className="text-xxs text-muted-foreground block">Clean</span>
                    <span className="text-xs font-mono font-semibold">{ag.metrics.cleanliness}%</span>
                  </div>
                  <div>
                    <span className="text-xxs text-muted-foreground block">Sec</span>
                    <span className="text-xs font-mono font-semibold">{ag.metrics.security}%</span>
                  </div>
                  <div>
                    <span className="text-xxs text-muted-foreground block">Perf</span>
                    <span className="text-xs font-mono font-semibold">{ag.metrics.performance}%</span>
                  </div>
                  <div>
                    <span className="text-xxs text-muted-foreground block">Robust</span>
                    <span className="text-xs font-mono font-semibold">{ag.metrics.robustness}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
