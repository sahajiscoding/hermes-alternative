import { DownloadIcon, DeveloperIcon, GithubIcon, MonitorIcon, ShieldIcon, CpuIcon, ZapIcon } from './icons'

const EXE_DOWNLOAD_URL = 'https://github.com/sahajiscoding/hermes-alternative/releases/latest/download/Hermes-Alternative-Setup-1.0.0.exe'
const PORTABLE_DOWNLOAD_URL = 'https://github.com/sahajiscoding/hermes-alternative/releases/latest/download/Hermes-Alternative-1.0.0.exe'
const GITHUB_REPO_URL = 'https://github.com/sahajiscoding/hermes-alternative'

export function DashboardPage() {
  return (
    <div className="flex flex-col items-center text-center space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="space-y-6 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center justify-center size-24 rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-primary/20 border border-primary/30 text-primary mb-6">
          <DeveloperIcon className="size-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-primary dark:from-neutral-50 dark:via-neutral-200 dark:to-primary bg-clip-text text-transparent">
          Hermes Alternative
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Local-first desktop coding agent. Runs entirely on your machine — no cloud, no telemetry, no account required.
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-sm text-muted-foreground dark:text-neutral-500">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/50 dark:bg-neutral-800 border border-neutral-700/50">
            <ShieldIcon className="size-4 text-emerald-500" />
            <span>100% Local</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/50 dark:bg-neutral-800 border border-neutral-700/50">
            <CpuIcon className="size-4 text-amber-500" />
            <span>BYOK API Keys</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/50 dark:bg-neutral-800 border border-neutral-700/50">
            <ZapIcon className="size-4 text-violet-500" />
            <span>Fast & Private</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-800/50 dark:bg-neutral-800 border border-neutral-700/50">
            <MonitorIcon className="size-4 text-blue-500" />
            <span>Windows 10/11</span>
          </span>
        </div>
      </section>

      {/* Download Section */}
      <section className="w-full max-w-3xl px-4">
        <div className="bg-neutral-900/50 dark:bg-neutral-900/80 border border-neutral-800/50 dark:border-neutral-700 rounded-2xl p-6 md:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-semibold">Download for Windows</h2>
            <p className="text-muted-foreground dark:text-neutral-400">Choose your preferred installation method</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Installer */}
            <a
              href={EXE_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-xl border border-neutral-800/50 dark:border-neutral-700 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
            >
              <div className="flex items-center justify-center size-14 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                <DownloadIcon className="size-7" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">Windows Installer</h3>
                <p className="text-sm text-muted-foreground dark:text-neutral-400">NSIS Setup • Auto-updates</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">~120 MB</p>
              </div>
              <span className="text-xs font-medium text-primary/80 dark:text-primary flex items-center gap-1">
                Download <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>

            {/* Portable */}
            <a
              href={PORTABLE_DOWNLOAD_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 rounded-xl border border-neutral-800/50 dark:border-neutral-700 p-6 transition-all hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/10"
            >
              <div className="flex items-center justify-center size-14 rounded-xl bg-neutral-800/50 dark:bg-neutral-800 text-neutral-300 dark:text-neutral-100 group-hover:scale-110 transition-transform">
                <DownloadIcon className="size-7" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-lg">Portable Executable</h3>
                <p className="text-sm text-muted-foreground dark:text-neutral-400">No install • Run anywhere</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500">~115 MB</p>
              </div>
              <span className="text-xs font-medium text-primary/80 dark:text-primary flex items-center gap-1">
                Download <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </a>
          </div>

          <p className="text-xs text-center text-muted-foreground dark:text-neutral-500">
            By downloading, you agree to the <a href={`${GITHUB_REPO_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">MIT License</a>.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-5xl px-4 space-y-8">
        <h2 className="text-2xl font-semibold text-center">What you get</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {[
            {
              icon: ShieldIcon,
              color: 'text-emerald-500',
              title: 'Runs Locally',
              desc: 'No cloud dependency. Your code never leaves your machine.'
            },
            {
              icon: CpuIcon,
              color: 'text-amber-500',
              title: 'Bring Your Own Keys',
              desc: 'Use your own OpenAI, Anthropic, or local LLM API keys.'
            },
            {
              icon: ZapIcon,
              color: 'text-violet-500',
              title: 'Multi-Agent Modes',
              desc: 'Tournament, Crash-Out Auditor, Web Studio, Agent Terminal.'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="group rounded-xl border border-neutral-800/50 dark:border-neutral-700 p-6 transition-all hover:border-primary/30 hover:bg-neutral-900/30 dark:hover:bg-neutral-800/50"
            >
              <div className={`flex items-center justify-center size-12 rounded-xl bg-neutral-800/50 dark:bg-neutral-800 ${feature.color} mb-4 group-hover:scale-105 transition-transform`}>
                <feature.icon className="size-6" />
              </div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground dark:text-neutral-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-3xl px-4 py-8 border-t border-neutral-800/50 dark:border-neutral-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground dark:text-neutral-500">
          <p className="text-center sm:text-left">
            Hermes Alternative • Local-First Desktop Coding Agent
          </p>
          <div className="flex items-center gap-4">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-primary transition-colors"
            >
              <GithubIcon className="size-5" />
              <span>GitHub</span>
            </a>
            <a
              href={`${GITHUB_REPO_URL}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              Releases
            </a>
            <a
              href={`${GITHUB_REPO_URL}/blob/main/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
            >
              License
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}