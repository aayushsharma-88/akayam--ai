/**
 * AKAYAM AI — Storage Provider Abstraction
 * Handles file storage (local in dev, S3-compatible in production).
 */

import { join, dirname } from 'path'
import { writeFile, readFile, unlink, mkdir } from 'fs/promises'

export interface StoredFile {
  key: string
  url: string
  size: number
}

export interface StorageProvider {
  put(key: string, data: Buffer, mimeType: string): Promise<StoredFile>
  get(key: string): Promise<Buffer>
  delete(key: string): Promise<void>
  getUrl(key: string): string
}

/**
 * Local filesystem storage (development)
 */
class LocalStorageProvider implements StorageProvider {
  private baseDir: string
  private baseUrl: string

  constructor() {
    this.baseDir = join(process.cwd(), process.env.STORAGE_LOCAL_PATH ?? 'uploads')
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  }

  async put(key: string, data: Buffer, _mimeType: string): Promise<StoredFile> {
    const filePath = join(this.baseDir, key)
    const dir = dirname(filePath)
    await mkdir(dir, { recursive: true }).catch(() => {})
    await writeFile(filePath, data)
    return {
      key,
      url: this.getUrl(key),
      size: data.length,
    }
  }

  async get(key: string): Promise<Buffer> {
    const filePath = join(this.baseDir, key)
    return readFile(filePath)
  }

  async delete(key: string): Promise<void> {
    const filePath = join(this.baseDir, key)
    await unlink(filePath).catch(() => {})
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/api/files/serve/${encodeURIComponent(key)}`
  }
}

/**
 * Get the configured storage provider
 */
let _storage: StorageProvider | null = null

export function getStorage(): StorageProvider {
  if (_storage) return _storage

  const provider = process.env.STORAGE_PROVIDER ?? 'local'

  if (provider === 'local') {
    _storage = new LocalStorageProvider()
    return _storage
  }

  // S3 provider can be added here later
  // if (provider === 's3') { ... }

  // Default to local
  _storage = new LocalStorageProvider()
  return _storage
}
