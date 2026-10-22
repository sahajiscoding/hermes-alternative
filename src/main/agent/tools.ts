import { exec, spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

export interface ToolResult {
  success: boolean
  output: string
  error?: string
}

export class AgentTools {
  private workspaceRoot: string

  constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = path.resolve(workspaceRoot)
  }

  public setWorkspaceRoot(dir: string) {
    if (fs.existsSync(dir)) {
      this.workspaceRoot = path.resolve(dir)
    }
  }

  public getWorkspaceRoot(): string {
    return this.workspaceRoot
  }

  /**
   * Run command in workspace
   */
  public async runCommand(
    command: string,
    onChunk?: (data: string) => void
  ): Promise<ToolResult> {
    return new Promise((resolve) => {
      const isWindows = process.platform === 'win32'
      const shell = isWindows ? 'powershell.exe' : '/bin/bash'
      const args = isWindows ? ['-NoProfile', '-Command', command] : ['-c', command]

      let stdout = ''
      let stderr = ''

      const child = spawn(shell, args, {
        cwd: this.workspaceRoot,
        env: { ...process.env },
        windowsHide: true,
      })

      child.stdout.on('data', (chunk) => {
        const text = chunk.toString('utf8')
        stdout += text
        onChunk?.(text)
      })

      child.stderr.on('data', (chunk) => {
        const text = chunk.toString('utf8')
        stderr += text
        onChunk?.(text)
      })

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output: stdout || stderr,
          error: code !== 0 ? `Process exited with code ${code}` : undefined,
        })
      })

      child.on('error', (err) => {
        resolve({
          success: false,
          output: stdout,
          error: err.message,
        })
      })

      // 60-second execution safety timeout
      setTimeout(() => {
        try {
          child.kill('SIGTERM')
        } catch (e) {}
      }, 60000)
    })
  }

  /**
   * Read file contents
   */
  public readFile(filePath: string): ToolResult {
    try {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(this.workspaceRoot, filePath)

      if (!fs.existsSync(resolved)) {
        return { success: false, output: '', error: `File not found: ${filePath}` }
      }

      const content = fs.readFileSync(resolved, 'utf8')
      return { success: true, output: content }
    } catch (err: any) {
      return { success: false, output: '', error: err.message }
    }
  }

  /**
   * Write file contents
   */
  public writeFile(filePath: string, content: string): ToolResult {
    try {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(this.workspaceRoot, filePath)

      const dir = path.dirname(resolved)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      fs.writeFileSync(resolved, content, 'utf8')
      return { success: true, output: `Successfully wrote ${content.length} bytes to ${filePath}` }
    } catch (err: any) {
      return { success: false, output: '', error: err.message }
    }
  }

  /**
   * Edit file by replacing target string
   */
  public editFile(filePath: string, target: string, replacement: string): ToolResult {
    try {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(this.workspaceRoot, filePath)

      if (!fs.existsSync(resolved)) {
        return { success: false, output: '', error: `File not found: ${filePath}` }
      }

      const content = fs.readFileSync(resolved, 'utf8')
      if (!content.includes(target)) {
        return { success: false, output: '', error: 'Target string not found in file' }
      }

      const newContent = content.replace(target, replacement)
      fs.writeFileSync(resolved, newContent, 'utf8')
      return { success: true, output: `Successfully updated ${filePath}` }
    } catch (err: any) {
      return { success: false, output: '', error: err.message }
    }
  }

  /**
   * List directory contents
   */
  public listDir(dirPath: string = '.'): ToolResult {
    try {
      const resolved = path.isAbsolute(dirPath)
        ? dirPath
        : path.resolve(this.workspaceRoot, dirPath)

      if (!fs.existsSync(resolved)) {
        return { success: false, output: '', error: `Directory not found: ${dirPath}` }
      }

      const entries = fs.readdirSync(resolved, { withFileTypes: true })
      const list = entries.map((e) => `${e.isDirectory() ? '[DIR] ' : '      '}${e.name}`).join('\n')
      return { success: true, output: list }
    } catch (err: any) {
      return { success: false, output: '', error: err.message }
    }
  }
}

export const agentTools = new AgentTools()
