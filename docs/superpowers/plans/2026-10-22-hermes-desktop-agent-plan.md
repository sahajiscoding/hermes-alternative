# Implementation Plan: Hermes Desktop Agent & Mobile Remote Companion

- **Date**: 2026-10-22
- **Spec**: [2026-10-22-hermes-desktop-agent-design.md](file:///c:/Users/kids/Desktop/Backup%20Folders/sahaj%20ke%20programs/hermes-alternative/docs/superpowers/specs/2026-10-22-hermes-desktop-agent-design.md)
- **Target**: Windows Desktop `.exe` with Embedded LAN Server & Mobile Controller

---

## Architecture Overview

```
                                  +------------------------------------+
                                  |    Electron 34 Desktop Shell       |
                                  |  (React 19 + Vite + Tailwind CSS)  |
                                  |   Agndex Dashboard + Terminal      |
                                  +-----------------+------------------+
                                                    | IPC
                                  +-----------------v------------------+
                                  |    Electron Main Process (Node 24) |
                                  |  - Win32 Sleep Prevention Engine   |
                                  |  - BYOK Multi-Model Vault          |
                                  |  - Hermes Agent Execution Core     |
                                  |  - larp / 67 / crash-out Engines   |
                                  |  - Fastify Embedded LAN Server     |
                                  +-----------------+------------------+
                                                    | HTTP / WS (0.0.0.0:4152)
                                                    v
                                  +------------------------------------+
                                  |   Mobile Companion Web Controller  |
                                  |    (http://192.168.x.x:4152/mobile)|
                                  +------------------------------------+
```

---

## Phase Breakdown

### Phase 1: Project Initialization & Toolchain Setup
- Initialize root `package.json` with Electron 34, React 19, Vite, Tailwind CSS, Fastify, `@fastify/cors`, `@fastify/websocket`, `lucide-react`, `clsx`, `tailwind-merge`, and `electron-builder`.
- Configure TypeScript (`tsconfig.json`, `tsconfig.node.json`).
- Configure Vite (`vite.config.ts`) with React and Tailwind plugins.
- Set up project directory structure:
  - `src/main/`: Electron main process, Win32 power management, Fastify server, Agent engine.
  - `src/preload/`: Secure `contextBridge` exposure.
  - `src/renderer/`: React frontend (Agndex dashboard, live terminal, mobile client).

### Phase 2: Agndex Dashboard & Apple Design Foundation
- Port and adapt the user's provided Agndex dashboard components into `src/renderer/`:
  - `components/agndex/icons.tsx` (SVG icon system)
  - `components/agndex/logo.tsx` (Agndex logo)
  - `components/agndex/navigation.tsx`
  - `components/agndex/theme-provider.tsx` & `theme-toggle.tsx`
  - `components/agndex/topbar.tsx`
  - `components/agndex/sidebar.tsx`
  - `components/agndex/api-keys-page.tsx` (BYOK multi-portal manager)
  - `components/agndex/billing-page.tsx` (usage quotas and metrics)
  - `components/agndex/dashboard-page.tsx` (active projects and agent tasks)
  - `dashboard-layout.tsx` & `data.tsx`
  - `components/ui/` primitives (button, badge, avatar, dropdown-menu, dialog)
- Implement Apple design fluid micro-interactions:
  - Press states (`:active { transform: scale(0.98); }`)
  - Fast feedback transitions
  - Accessible 4.5:1 color contrast tokens

### Phase 3: Windows Win32 Sleep Prevention Engine
- Build `src/main/power.ts`:
  - Implements `SetThreadExecutionState` via PowerShell P/Invoke or native edge binding.
  - Flags: `ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED`.
  - Methods: `enableKeepAwake(reason: string)`, `disableKeepAwake()`, `getKeepAwakeStatus()`.
  - Automatically activates when agent tasks are running or when a mobile session is paired.

### Phase 4: Embedded Fastify Server & Sesori-Compatible API
- Build `src/main/server.ts`:
  - Detects active local network IPv4 address (`192.168.x.x`).
  - Binds to `0.0.0.0:4152` (with auto-increment on port conflict).
  - Implements PIN/Token pairing security.
  - Endpoints matching the Sesori specification:
    - `GET /api/v1/health`: Host stats, LAN IP, battery/sleep prevention state.
    - `POST /api/v1/devices/pair`: Pairing handshake.
    - `GET /api/v1/sessions`: Active agent sessions.
    - `POST /api/v1/sessions`: Launch new agent run.
    - `POST /api/v1/sessions/:id/messages`: Send user instructions/prompts.
    - `POST /api/v1/sessions/:id/approve`: Approve/reject tool calls.
    - `POST /api/v1/sessions/:id/abort`: Stop current step.
    - `GET /api/v1/system/power`: Sleep prevention telemetry.
    - `POST /api/v1/system/power/toggle`: Manual sleep prevention override.
    - `GET /ws/agent-stream`: Real-time WebSocket event broadcaster.
  - Serves static mobile web app at `http://<LAN_IP>:4152/mobile`.

### Phase 5: BYOK Model Router & Core Agent Engine
- Build `src/main/agent/`:
  - `vault.ts`: Local encrypted credential storage (`settings.json` via DPAPI/`safeStorage`).
  - `router.ts`: Unified LLM client supporting OpenAI, Anthropic, Gemini, Groq, OpenRouter, DeepSeek, and local Ollama/vLLM endpoints.
  - `tools.ts`: Sandbox-checked tool executors:
    - `run_command` (terminal execution with live chunk streaming).
    - `read_file`, `write_file`, `edit_file`.
    - `list_dir`, `search_files`.
  - `engine.ts`: Multi-turn Hermes / OpenCode autonomous loop:
    - System prompt injection.
    - Streaming thoughts and tool calls.
    - Human-in-the-loop permission checks.

### Phase 6: Specialized Agent Execution Engines
- Build `src/main/agent/modes/`:
  - `larp.ts`: **Anti-Slop Design Mode**:
    - Pre-prompt constraints and post-generation AST/CSS linter enforcing intentional typography, purposeful palettes, and stripping out generic AI boilerplate.
  - `tournament.ts`: **Six-Agent Tournament (`67`)**:
    - Spawns 6 distinct internal personas (Minimalist, Security Sentinel, Performance Optimizer, Polish Specialist, Robustness Hunter, Synthesizer).
    - Parallel candidate evaluation and scoring matrix with visual dashboard leaderboard.
  - `crashOut.ts`: **Self-Attacking Stress-Tester (`crash-out`)**:
    - Red-team auditor attacking code and shell proposals for command injection, path traversal, race conditions, and edge cases.
    - Emits a Crash-Out Confidence Score before changes are committed.

### Phase 7: Mobile Controller UI & QR Pairing Integration
- Build responsive mobile controller interface (`src/renderer/mobile/`):
  - Touch-friendly 44px+ tap targets.
  - Live agent stream view (thoughts, diff viewer, terminal logs).
  - Quick approval buttons ("Approve", "Reject", "Abort").
  - Sleep prevention status indicator.
- Build Desktop QR Code Dialog:
  - Generates QR code encoding `http://<LAN-IP>:4152/mobile?token=<PAIRING_TOKEN>`.
  - Displays one-click copyable LAN URL in the desktop topbar.

### Phase 8: Verification & Windows .exe Packaging
- Run end-to-end verification of:
  - Local server startup and mobile responsiveness.
  - Sleep prevention state toggles.
  - Multi-provider API credential validation.
  - Agent tool execution and mode switching (`larp`, `67`, `crash-out`).
- Configure `electron-builder.json` with NSIS installer script.
- Execute package build (`npm run dist:win`).
