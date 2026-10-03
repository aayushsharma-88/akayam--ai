import type { ImageProvider } from './base-provider'
import type { ImageGenerationOptions, ImageGenerationResult, AIProviderInfo } from '../types'

const AI_HORDE_API = 'https://aihorde.net/api/v2'
// Anonymous key — works for free, low-priority queue
// Set AIHORDE_API_KEY in .env for a free account key = faster queue
const AI_HORDE_KEY = process.env.AIHORDE_API_KEY || '0000000000'

/** Fetch image bytes from a URL and return as base64 data URL */
async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`Failed to fetch image from ${url}: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const mimeType = res.headers.get('content-type') || 'image/webp'
  return `data:${mimeType};base64,${Buffer.from(arrayBuffer).toString('base64')}`
}

export class FreeImageProvider implements ImageProvider {
  readonly id = 'flux-schnell-hf'

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'FLUX.1 Schnell (High Quality)',
      isConfigured: true,
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: ['flux-schnell'],
      }
    }
  }

  isConfigured(): boolean { return true }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const prompt = options.prompt || 'random art'
    
    try {
      // 1. Initiate job
      const initRes = await fetch('https://black-forest-labs-flux-1-schnell.hf.space/gradio_api/call/infer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: [prompt, 0, true, 1024, 1024, 4]
        })
      })
      
      if (!initRes.ok) throw new Error('Failed to connect to Image Generator API.')
      const { event_id } = await initRes.json()
      
      // 2. Wait for generation to complete (fetches the full Server-Sent Events stream)
      const streamRes = await fetch(`https://black-forest-labs-flux-1-schnell.hf.space/gradio_api/call/infer/${event_id}`)
      const text = await streamRes.text()
      
      let imageUrl = ''
      const lines = text.split('\n')
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('event: complete')) {
          const dataLine = lines[i+1]?.replace('data: ', '')
          if (dataLine) {
            const parsed = JSON.parse(dataLine)
            imageUrl = parsed[0]?.url || ''
          }
        }
      }
      
      if (!imageUrl) throw new Error('Image generation failed or timed out.')

      return {
        images: [{ url: imageUrl }],
        provider: this.id,
        model: 'flux-schnell',
      }
    } catch (e: any) {
      throw new Error(`Image Generation Error: ${e.message}`)
    }
  }
}

import type { TextProvider, TTSProvider } from './base-provider'
import type { TextGenerationOptions, TextGenerationResult, TTSOptions, TTSResult } from '../types'

export class FreeTextProvider implements TextProvider {
  readonly id = 'free-text'

  getInfo() {
    return {
      id: this.id,
      name: 'Pollinations Free Chat',
      isConfigured: true,
      capabilities: {
        streaming: true,
        vision: false,
        functionCalling: false,
        maxContextTokens: 4096,
        supportedModels: ['openai'],
      }
    }
  }

  isConfigured(): boolean { return true }

  async generateText(options: TextGenerationOptions): Promise<TextGenerationResult> {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          ...options.messages.map(m => ({ role: m.role, content: m.content }))
        ],
        model: 'openai'
      })
    })
    const text = await res.text()
    return { text, model: 'pollinations', provider: this.id }
  }

  async *streamText(options: TextGenerationOptions): AsyncGenerator<string> {
    try {
      const res = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
            ...options.messages.map(m => ({ role: m.role, content: m.content }))
          ],
          model: 'openai'
        })
      })
      const text = await res.text()
      // Simulate streaming
      const chunks = text.match(/.{1,10}/g) || []
      for (const chunk of chunks) {
        yield chunk
        await new Promise(r => setTimeout(r, 20))
      }
    } catch(e: any) {
      throw new Error('Free AI Chat Failed: ' + e.message)
    }
  }
}

export class FreeTTSProvider implements TTSProvider { 
  async getVoices() { return [] } 
  readonly id = 'free-tts'
  isConfigured() { return true }
  getInfo() { return { id: this.id, name: 'Google Translate Voice', isConfigured: true, capabilities: { streaming: false, vision: false, functionCalling: false, maxContextTokens: 0, supportedModels: ['google'] } } }
  
  async synthesize(options: TTSOptions): Promise<TTSResult> {
    const encoded = encodeURIComponent(options.text.substring(0, 200)) // Google has a ~200 char limit
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encoded}`
    
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      })
      if (!res.ok) throw new Error(`Google TTS returned ${res.status}`)
      
      const arrayBuffer = await res.arrayBuffer()
      
      return {
        audioBuffer: Buffer.from(arrayBuffer), 
        mimeType: 'audio/mpeg',
        provider: this.id
      } as any
    } catch (e: any) {
      throw new Error(`TTS Fetch Error: ${e.message}`)
    }
  }
}
