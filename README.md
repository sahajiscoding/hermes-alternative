# Hermes Alternative - Autonomous Desktop Coding Agent

Hermes Alternative is an autonomous desktop coding agent built for Windows with bring-your-own-key (BYOK) multi-provider support, an embedded local server implementing the **Sesori API specification** for remote smartphone control and native Win32 **sleep prevention**

---

## Features

1. **Standalone Windows `.exe` Installer**: Packaged with NSIS via `electron-builder`.
2. **Bring Your Own Key (BYOK) Vault**:
   - OpenAI, Anthropic, Google Gemini, Groq, OpenRouter, DeepSeek, and Local Ollama / vLLM.
   - Encrypted locally on your machine with Windows DPAPI.
   - One-click `.env` export and download.
3. **Remote Smartphone Control (Sesori API)**:
   - Exposes an embedded Fastify server on your local Wi-Fi network (`http://192.168.x.x:4152`).
   - Pairs securely via 6-digit PIN and dynamic QR code.
   - Full duplex WebSocket stream for real-time thoughts, tool execution, and approval prompts.
4. **Win32 Sleep Prevention Engine**:
   - Calls `kernel32.dll!SetThreadExecutionState` (`ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_AWAYMODE_REQUIRED`).
   - Automatically keeps your desktop awake while background agent tasks run or while phone sessions are active.
5. **Agndex Developer Dashboard**:
   - Sleek Apple-calibrated UI with dark/light themes, project indexes, resource tracking, and agent session inspector.

---

## Quick Start

### 1. Development Mode
```bash
# Install dependencies
npm install

# Start Vite dev server and launch Electron
npm run app:dev
```

### 2. Building Standalone Desktop App (.exe)
```bash
# Compile TypeScript and Vite assets
npm run build

# Package Windows NSIS installer
npm run dist:win
```
The installer executable is generated inside `dist-pack/`.

---

## Connecting from Your Smartphone
1. Connect your iPhone or Android phone to the same Wi-Fi network as your PC.
2. In the desktop app, click **Pair Phone** or navigate to **Mobile Companion**.
3. Scan the QR code with your phone camera, or open your mobile browser to `http://<YOUR_PC_LAN_IP>:4152/mobile`.
4. Enter the 6-digit PIN to authenticate and start controlling agent tasks!
