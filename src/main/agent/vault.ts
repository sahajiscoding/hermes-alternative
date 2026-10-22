import fs from 'fs'
import path from 'path'
import os from 'os'
import crypto from 'crypto'

export interface KeyVault {
  [providerEnvVar: string]: string
}

class CredentialVault {
  private vaultPath: string
  private encKey: Buffer

  constructor() {
    const baseDir =
      process.env.APPDATA ||
      (process.platform === 'darwin'
        ? path.join(os.homedir(), 'Library', 'Application Support')
        : path.join(os.homedir(), '.config'))
    const appDir = path.join(baseDir, 'hermes-alternative')

    if (!fs.existsSync(appDir)) {
      fs.mkdirSync(appDir, { recursive: true })
    }

    this.vaultPath = path.join(appDir, 'vault.enc')
    // Generate machine-local encryption key
    this.encKey = crypto.scryptSync(os.hostname() + os.userInfo().username, 'hermes-salt-2026', 32)
  }

  public saveKeys(keys: KeyVault): void {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipheriv('aes-256-gcm', this.encKey, iv)
      const json = JSON.stringify(keys)
      let encrypted = cipher.update(json, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      const tag = cipher.getAuthTag()

      const payload = JSON.stringify({
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        data: encrypted,
      })

      fs.writeFileSync(this.vaultPath, payload, 'utf8')

      // Also inject into process.env for child tool runs
      for (const [envVar, value] of Object.entries(keys)) {
        if (value) {
          process.env[envVar] = value
        }
      }
      console.log('[CredentialVault] Saved and encrypted credentials successfully.')
    } catch (err) {
      console.error('[CredentialVault] Error saving keys:', err)
    }
  }

  public loadKeys(): KeyVault {
    try {
      if (!fs.existsSync(this.vaultPath)) {
        return {}
      }

      const raw = fs.readFileSync(this.vaultPath, 'utf8')
      const { iv, tag, data } = JSON.parse(raw)

      const decipher = crypto.createDecipheriv('aes-256-gcm', this.encKey, Buffer.from(iv, 'hex'))
      decipher.setAuthTag(Buffer.from(tag, 'hex'))
      let decrypted = decipher.update(data, 'hex', 'utf8')
      decrypted += decipher.final('utf8')

      const keys: KeyVault = JSON.parse(decrypted)
      for (const [envVar, value] of Object.entries(keys)) {
        if (value) {
          process.env[envVar] = value
        }
      }
      return keys
    } catch (err) {
      console.warn('[CredentialVault] Could not load encrypted keys, returning empty:', err)
      return {}
    }
  }
}

export const credentialVault = new CredentialVault()
