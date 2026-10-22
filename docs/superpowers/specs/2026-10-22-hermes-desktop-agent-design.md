# System Design Document: Hermes Desktop Agent & Mobile Remote Companion

- **Date**: 2026-10-22
- **Status**: Proposed (Awaiting Partner Approval)
- **Scope**: Full Project
- **Target OS**: Windows 11 / Windows 10 (Packaged as `.exe` installer)

---

## 1. Intent and Why

Developers frequently work with autonomous coding agents (like OpenCode, Hermes, and Claude Code) that execute multi-step terminal tasks, edit files, and run tests. However, existing tools suffer from two major friction points:
1. **Lack of portable, multi-provider BYOK (Bring-Your-Own-Key) management**: Users are often locked into single subscription silos or forced to manage fragile environment variables manually.
2. **Tethered execution**: When an agent undertakes a long task (code migrations, test generation, security audits), developers must remain in front of their PC or risk Windows going to sleep, interrupting the run.

This project delivers a **Windows Desktop Coding Agent (`.exe`)** with:
- An Apple-grade, high-polish desktop UI inspired by the Agndex developer portal.
- An embedded local server (`http://192.168.x.x:port`) implementing the Sesori API specification, serving a responsive mobile controller directly to any phone browser on the local Wi-Fi.
- Windows Win32 sleep-prevention (`SetThreadExecutionState`) to keep the desktop host awake during background tasks.
- Three specialized agent modes: **Anti-slop design mode (`larp`)**, **Six-agent tournament (`67`)**, and **Self-attacking stress-testing (`crash-out`)**.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **Self-Contained Windows Executable**: Package a native Windows application with an NSIS `.exe` installer via `electron-builder`.
- **BYOK Multi-Portal Credential Management**: Visual credential vault supporting OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, DeepSeek, and local LLMs (Ollama / vLLM), with key masking, validation testing, and `.env` export.
- **Embedded Local Server & QR Mobile Pairing**: Embedded Fastify/WebSocket engine exposing the Sesori-compatible API on the LAN IP (`192.168.x.x:port`) with real-time SSE/WebSocket streams and QR code pairing.
- **Windows Sleep Prevention**: Automatically invoke Win32 `SetThreadExecutionState` when tasks are running or when phone remote session is engaged.
- **Interactive Agndex Dashboard**: Integrated UI with API keys, usage tracking, project indexes, live agent terminal, and light/dark theme toggles.
- **Tri-Engine Agent Capabilities**:
  - `larp` (Anti-slop design engine enforcing clean, non-generic typography and UI).
  - `67` (Six-agent competitive tournament vetting multiple parallel candidate solutions).
  - `crash-out` (Adversarial red-team auditor grilling assumptions, security boundaries, and edge cases).

### Non-Goals
- Cloud hosting or remote relay servers: All networking is strictly peer-to-peer over the local area network (LAN) for maximum privacy and zero latency.
- Custom mobile app stores: The mobile interface is served natively over HTTP/WebSocket as a responsive web app/PWA, requiring no App Store / Play Store installation.

### Anti-Goals
- No telemetry or unauthorized external API key leaks: Keys remain strictly local on the developer's PC.
- No generic, AI-slop user interfaces: Every screen, button, and animation adheres to the strict guidelines of `ui-ux-pro-max`, `frontend-design`, and `apple-design`.

---

## 3. Constraints & Prerequisites

- **Host Environment**: Windows 10/11 with Node.js 24 and npm installed.
- **Security & Network**: The local server listens on `0.0.0.0:4152` or a user-selected port, protected by an ephemeral PIN or token exchange to prevent unauthorized local network access.
- **Packaging**: Zero external toolchain requirements (no Rust or C++ compiler required for the end user).

---

## 4. Evaluated Approaches & Trade-Offs

### Approach 1: Integrated Electron Desktop Shell with Embedded Fastify Server *(Selected)*
- **Architecture**: Electron 34+ with Vite + React 19 + Tailwind CSS for the frontend. Fastify embedded in the Node.js main process serving the Sesori API and mobile client.
- **Trade-offs**: ~90 MB installer footprint, but uses the system's existing Node 24 runtime, eliminates cross-language IPC bottlenecks, and packages cleanly to Windows NSIS `.exe`.
- **Verdict**: **Selected by human partner**.

### Approach 2: Python (FastAPI) Backend + PyWebView/PyInstaller
- **Trade-offs**: Dual-runtime packaging (Node frontend + Python backend) is notoriously fragile on Windows and prone to false-positive Windows Defender flags.
- **Verdict**: Rejected.

### Approach 3: Background Node Daemon + Browser PWA
- **Trade-offs**: No true desktop window, poor OS window management, and cumbersome system tray lifecycle.
- **Verdict**: Rejected.

---

## 5. System Architecture & Detailed Design

```
+-----------------------------------------------------------------------------------+
|                            WINDOWS DESKTOP APPLICATION                             |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                     ELECTRON RENDERER (React 19 + Vite)                     |  |
|  |                                                                             |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  |  |                           AGNDEX DASHBOARD                            |  |  |
|  |  |  - DashboardPage (Project & Session Overview)                         |  |  |
|  |  |  - ApiKeysPage (BYOK Multi-Portal Management & .env Generator)        |  |  |
|  |  |  - BillingPage (Token Quotas, Cost Tracker, Resource Rows)             |  |  |
|  |  |  - AgentTerminalView (Real-time PTY, Diff Viewer, Human Approval)     |  |  |
|  |  |  - TournamentModal (67 Six-Agent Tournament Inspector)                |  |  |
|  |  |  - CrashOutInspector (Self-Attacking Security & Correctness Griller) |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +---------------------------------------+-------------------------------------+  |
|                                          | IPC (contextBridge)                    |
|  +---------------------------------------v-------------------------------------+  |
|  |                           ELECTRON MAIN PROCESS                             |  |
|  |                                                                             |  |
|  |  +---------------------------+   +---------------------------------------+  |  |
|  |  |     WIN32 POWER HOOK      |   |             AGENT CORE                |  |  |
|  |  | SetThreadExecutionState   |   | - Hermes / OpenCode Execution Loop    |  |  |
|  |  | (ES_CONTINUOUS |          |   | - Tool Execution (Terminal, File, Git)|  |  |
|  |  |  ES_SYSTEM_REQUIRED |     |   | - Multi-Model BYOK Provider Router    |  |  |
|  |  |  ES_AWAYMODE_REQUIRED)    |   | - Anti-Slop (larp) Stylizer Engine    |  |  |
|  |  +---------------------------+   | - Six-Agent (67) Tournament Hub       |  |  |
|  |                                  | - Self-Attacking (crash-out) Checker  |  |  |
|  |                                  +-------------------+-------------------+  |  |
|  |                                                      |                      |  |
|  |  +---------------------------------------------------v-------------------+  |  |
|  |  |                     EMBEDDED FASTIFY LOCAL SERVER                     |  |  |
|  |  |                     (Binds to 0.0.0.0:4152 / LAN)                     |  |  |
|  |  |  - Sesori REST Endpoints (/api/v1/sessions, /api/v1/health, /pair)    |  |  |
|  |  |  - WebSocket Streaming (/ws/agent-stream)                             |  |  |
|  |  |  - Static Mobile Web Client (/mobile)                                 |  |  |
|  |  +-----------------------------------------------------------------------+  |  |
|  +---------------------------------------+-------------------------------------+  |
+------------------------------------------|----------------------------------------+
                                           | Local Wi-Fi (HTTP / WebSocket)
                                           v
                         +-----------------------------------+
                         |      SMARTPHONE MOBILE BROWSER    |
                         |   http://192.168.x.x:4152/mobile   |
                         |                                   |
                         | - Responsive Touch Controller     |
                         | - Live Stream of Agent Output     |
                         | - Interactive Tool Approvals      |
                         | - Sleep-Prevention Status Indicator|
                         | - Prompt Input & Session Controls |
                         +-----------------------------------+
```

---

## 6. Component Specifications

### 6.1. BYOK Multi-Portal Credentials & Vault
- **Supported Providers**:
  - OpenAI (`sk-...`)
  - Anthropic (`sk-ant-...`)
  - Google Gemini (`AIza...`)
  - Groq (`gsk_...`)
  - OpenRouter (`sk-or-...`)
  - DeepSeek (`sk-...`)
  - Ollama / Local (`http://localhost:11434`)
- **Key Storage**: Local encrypted configuration (`settings.json` encrypted using Windows DPAPI / Electron `safeStorage`).
- **Features**: Eye toggle to reveal/mask, copy button with animated checkmark feedback, live ping verification to validate credentials against the provider's models endpoint, and one-click `.env` generation/download.

### 6.2. Embedded Fastify Server & Sesori API Compatibility
- **Routes**:
  - `GET /api/v1/health`: Server status, LAN IP, active agent state, battery/sleep prevention status.
  - `POST /api/v1/devices/pair`: PIN-based authentication pairing for mobile browsers.
  - `GET /api/v1/sessions`: Active and historical agent sessions.
  - `POST /api/v1/sessions`: Create new agent session with selected model, mode, and workspace folder.
  - `POST /api/v1/sessions/:id/prompt`: Send user instruction to agent.
  - `POST /api/v1/sessions/:id/abort`: Cancel running agent step.
  - `POST /api/v1/sessions/:id/approve`: Approve or reject tool call requiring human authorization.
  - `GET /api/v1/system/power`: Status of Windows sleep prevention.
  - `POST /api/v1/system/power/toggle`: Manually toggle sleep prevention.
  - `GET /ws/agent-stream`: Full duplex WebSocket channel broadcasting step events, tool executions, terminal chunks, diffs, and confirmations.

### 6.3. Windows Sleep Prevention Module
- Implemented in Node.js using edge-js or PowerShell P/Invoke execution to call `kernel32.dll!SetThreadExecutionState`:
  ```cpp
  // Flags:
  // ES_CONTINUOUS        = 0x80000000
  // ES_SYSTEM_REQUIRED   = 0x00000001
  // ES_AWAYMODE_REQUIRED = 0x00000040
  SetThreadExecutionState(ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED);
  ```
- Automatically triggered on agent task initiation or phone pairing; gracefully cleared (`ES_CONTINUOUS`) when tasks conclude or when user manually toggles it off.

### 6.4. The Three Specialized Execution Engines

#### 1. Anti-Slop Design Mode (`larp`)
- Integrated prompt filter and post-generation AST/CSS linter derived from `frontend-design` and `ui-ux-pro-max`:
- Eliminates AI tropes: bans decorative-only emojis in UI headers, tracks-out all-caps badges, repetitive terracotta/cream color schemes, and identical soft-shadowed SaaS cards.
- Enforces crisp typography (line lengths < 80 chars, deliberate type scales, 16px base font, 1.5 line height), Apple fluid physical motion guidelines, and 4.5:1 contrast ratios.

#### 2. Six-Agent Tournament (`67`)
- Orchestrates a parallel competitive evaluation among 6 distinct agent personas:
  1. *Architecture Minimalist* (smallest codebase, zero unnecessary abstractions).
  2. *Security Sentinel* (OWASP compliance, strict input hygiene, safe IPC).
  3. *Performance & Latency Optimizer* (minimal renders, fast memory footprint).
  4. *UX & Fluid Polish Specialist* (Apple motion, accessible states, haptic timing).
  5. *Robustness & Edge-Case Hunter* (unbounded input checks, error recovery).
  6. *Synthesizer & Lead Engineer* (combines the winning approaches).
- Displays a visual leaderboard in the dashboard showing metrics, critiques, and the selected synthesis.

#### 3. Self-Attacking Stress Tester (`crash-out`)
- Adversarial red-team verification loop:
- Before applying file modifications or running dangerous shell commands, a dedicated adversary agent attacks the proposal:
  - Tests for command injection, arbitrary path traversal, race conditions, memory leaks, and breaking changes.
  - Generates adversarial unit test fixtures to prove whether the fix withstands stress.
  - Outputs a "Crash-Out Confidence Score" (0–100%) and highlights points of failure before code touches disk.

### 6.5. UI and Apple-Grade Interaction Polish
- Dashboard structure matching the user's provided Agndex code:
  - `DashboardSidebar`, `DashboardTopbar`, `DashboardPage`, `ApiKeysPage`, `BillingPage`, `ThemeProvider`, `ThemeToggle`.
- Apple design principles:
  - Immediate visual response on `:active` pointer-down (scale 0.98, instant feedback).
  - Spring-based smooth drawers and modals.
  - Touch targets minimum 44×44px on mobile companion.
  - Zero un-animated layout shift (CLS < 0.1).

### 6.6. Builder Calls & Edge Cases Settled
- **Local Data Persistence**: Stored in `%APPDATA%/hermes-desktop-agent/` (configuration, encrypted key vault via Electron `safeStorage`, session history, and cached model profiles).
- **Offline Local Wi-Fi Operation**: The mobile controller bundle is entirely self-hosted within the Fastify static directory. Phone-to-desktop interaction works seamlessly over local Wi-Fi even without an active internet connection (internet is only required for outbound AI model API calls).
- **LAN Security & PIN Pairing**: To prevent unauthorized devices on shared Wi-Fi networks from hijacking agent execution, the desktop app generates an ephemeral 6-digit session PIN and displays an interactive QR code containing `http://<LAN-IP>:4152?token=<PAIRING_TOKEN>`.
- **Port Allocation**: Defaults to `4152`; if already occupied, automatically probes and binds to the next available port and broadcasts the active address in the topbar.

---

## 7. Packaging & Distribution Plan

- Build framework: `electron-builder` with target `nsis` (x64).
- Output: `dist/Hermes-Alternative-Setup.exe` (ready-to-install standalone desktop installer).
- Portable mode configuration available for zero-install execution if desired.

---

## 8. What's Left to the Builder (Implementation Roadmap)

1. **Phase 1**: Project Scaffolding (Electron 34 + React 19 + Vite + Tailwind CSS + Lucide + shadcn primitives).
2. **Phase 2**: Agndex Dashboard Integration (Layout, Topbar, Sidebar, API Keys, Billing, Projects, Theme Provider).
3. **Phase 3**: Windows Win32 Sleep Prevention Engine (`SetThreadExecutionState`).
4. **Phase 4**: Embedded Fastify Server & Sesori-Compatible REST/WebSocket API + Mobile Web Companion.
5. **Phase 5**: Core Coding Agent Engine (Tool execution, terminal execution, BYOK model routing).
6. **Phase 6**: Specialized Modes (`larp`, `67` Tournament, `crash-out` Stress-Tester).
7. **Phase 7**: `.exe` Installer Packaging & Verification.
