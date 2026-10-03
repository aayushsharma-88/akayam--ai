import { KokoroTTS } from 'kokoro-js'
import fs from 'fs'
import path from 'path'

// Monkey patch fs.promises.readFile to fix Kokoro-js hardcoded paths when bundled by Next.js
const originalReadFile = fs.promises.readFile
fs.promises.readFile = async function (filePath: string | Buffer | URL, options?: any) {
  if (typeof filePath === 'string' && filePath.includes('kokoro-js') && filePath.includes('voices')) {
    const voiceFile = path.basename(filePath)
    const correctPath = path.join(process.cwd(), 'node_modules', 'kokoro-js', 'voices', voiceFile)
    return originalReadFile(correctPath, options)
  }
  return originalReadFile(filePath, options)
} as any

let ttsInstance: any = null
let isInitializing = false

export async function getKokoroInstance() {
  if (ttsInstance) return ttsInstance
  
  if (isInitializing) {
    // Wait until it's initialized by another request
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return ttsInstance
  }

  try {
    isInitializing = true
    console.log('[Kokoro] Loading local TTS model...')
    ttsInstance = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype: 'q8',
    })
    console.log('[Kokoro] Local TTS model loaded successfully.')
    return ttsInstance
  } catch (error) {
    console.error('[Kokoro] Failed to load model:', error)
    throw error
  } finally {
    isInitializing = false
  }
}

/**
 * Encodes Float32Array PCM data to a WAV buffer.
 */
export function encodeWAV(samples: Float32Array, sampleRate: number): Buffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)
  
  const writeString = (v: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      v.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true)
  
  let offset = 44
  for (let i = 0; i < samples.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
  }
  
  return Buffer.from(buffer)
}
