/**
 * In-Browser Virtual File System (VFS)
 * 
 * Manages project files in memory with real-time bundling
 * into sandboxed HTML preview payloads like Freebuff & Bolt.
 */

export interface VirtualFile {
  name: string
  path: string
  content: string
  language: string
}

export interface ProjectTemplate {
  name: string
  description: string
  files: Record<string, string>
}

export const TEMPLATES: Record<string, ProjectTemplate> = {
  saas: {
    name: 'Modern SaaS Landing',
    description: 'Clean, Apple-grade landing page with pricing, features, and fluid motion.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Apex - Next Gen Platform</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    button:active { transform: scale(0.98); }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
  <header class="border-b border-zinc-800 bg-zinc-900 px-6 py-4 flex items-center justify-between sticky top-0">
    <div class="flex items-center gap-2">
      <div class="size-6 bg-white rounded-md"></div>
      <span class="font-bold text-lg tracking-tight">Apex</span>
    </div>
    <nav class="hidden md:flex items-center gap-6 text-sm text-zinc-400">
      <a href="#features" class="hover:text-white transition-colors">Features</a>
      <a href="#pricing" class="hover:text-white transition-colors">Pricing</a>
      <a href="#changelog" class="hover:text-white transition-colors">Changelog</a>
    </nav>
    <button class="bg-white text-zinc-950 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-zinc-200 transition-transform">
      Get Started
    </button>
  </header>

  <main class="flex-1 max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center gap-8">
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
      <span class="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
      <span>v2.4 Released with Instant Sync</span>
    </div>

    <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight max-w-3xl leading-[1.1]">
      Software built for speed, designed with restraint.
    </h1>

    <p class="text-zinc-400 text-lg max-w-xl leading-relaxed">
      A minimal, ultra-fast workspace that adapts to your creative workflow. Zero bloat, zero distractions.
    </p>

    <div class="flex items-center gap-3 mt-4">
      <button class="bg-white text-zinc-950 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg">
        Start Free Trial
      </button>
      <button class="border border-zinc-800 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-zinc-900 transition-colors">
        View Live Demo
      </button>
    </div>

    <!-- Feature Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
      <div class="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 flex flex-col gap-3">
        <h3 class="font-semibold text-white">Sub-millisecond State</h3>
        <p class="text-sm text-zinc-400">Local-first architecture guarantees zero latency on typing and navigation.</p>
      </div>
      <div class="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 flex flex-col gap-3">
        <h3 class="font-semibold text-white">Apple Fluid Motion</h3>
        <p class="text-sm text-zinc-400">Interruptible springs and physical gestures make interactions feel alive.</p>
      </div>
      <div class="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 flex flex-col gap-3">
        <h3 class="font-semibold text-white">Adversarial Audits</h3>
        <p class="text-sm text-zinc-400">Integrated red-team checks stress-test data integrity continuously.</p>
      </div>
    </div>
  </main>
</body>
</html>`,
    },
  },
  dashboard: {
    name: 'Full-Stack Analytics App',
    description: 'Interactive dashboard with dynamic charts and metrics.',
    files: {
      'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pulse Analytics</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen p-6 font-sans">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex items-center justify-between border-b border-zinc-800 pb-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">Pulse Analytics</h1>
        <p class="text-xs text-zinc-400">Real-time system telemetry</p>
      </div>
      <button class="bg-zinc-100 text-zinc-950 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-zinc-200">
        Export Report
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <span class="text-xs text-zinc-400">Active Sessions</span>
        <p class="text-2xl font-bold mt-1">1,842</p>
        <span class="text-xs text-emerald-400">↑ 12% today</span>
      </div>
      <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <span class="text-xs text-zinc-400">Throughput</span>
        <p class="text-2xl font-bold mt-1">42.8k ops</p>
        <span class="text-xs text-emerald-400">↑ 4% peak</span>
      </div>
      <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <span class="text-xs text-zinc-400">Average Latency</span>
        <p class="text-2xl font-bold mt-1">1.8 ms</p>
        <span class="text-xs text-emerald-400">Optimal</span>
      </div>
      <div class="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
        <span class="text-xs text-zinc-400">CPU Usage</span>
        <p class="text-2xl font-bold mt-1">14%</p>
        <span class="text-xs text-zinc-400">8 cores active</span>
      </div>
    </div>

    <div class="p-6 rounded-xl border border-zinc-800 bg-zinc-900/40">
      <h2 class="text-sm font-semibold mb-4">Traffic Velocity (24 Hours)</h2>
      <canvas id="trafficChart" height="100"></canvas>
    </div>
  </div>

  <script>
    const ctx = document.getElementById('trafficChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [{
          label: 'Requests/sec',
          data: [1200, 950, 3100, 4800, 5200, 3900, 2400],
          borderColor: '#38bdf8',
          backgroundColor: 'rgba(56, 189, 248, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  </script>
</body>
</html>`,
    },
  },
}

export class VirtualFileSystem {
  private files: Map<string, VirtualFile> = new Map()

  constructor(initialFiles: Record<string, string> = TEMPLATES.saas.files) {
    this.loadTemplateFiles(initialFiles)
  }

  public loadTemplateFiles(files: Record<string, string>) {
    this.files.clear()
    for (const [name, content] of Object.entries(files)) {
      const ext = name.split('.').pop() || 'txt'
      const language = ext === 'html' ? 'html' : ext === 'js' ? 'javascript' : ext === 'css' ? 'css' : 'json'
      this.files.set(name, {
        name,
        path: `/${name}`,
        content,
        language,
      })
    }
  }

  public getFiles(): VirtualFile[] {
    return Array.from(this.files.values())
  }

  public getFile(name: string): VirtualFile | undefined {
    return this.files.get(name)
  }

  public writeFile(name: string, content: string) {
    const ext = name.split('.').pop() || 'txt'
    const language = ext === 'html' ? 'html' : ext === 'js' ? 'javascript' : ext === 'css' ? 'css' : 'json'
    this.files.set(name, {
      name,
      path: `/${name}`,
      content,
      language,
    })
  }

  public deleteFile(name: string) {
    this.files.delete(name)
  }

  /**
   * Generates a self-contained HTML bundle for live iframe preview
   */
  public generatePreviewPayload(): string {
    const indexHtml = this.files.get('index.html')?.content || '<div style="color:white">No index.html found</div>'
    return indexHtml
  }
}
