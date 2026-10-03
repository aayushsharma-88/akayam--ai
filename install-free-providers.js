const fs = require('fs');

// 1. UPDATE FREE MEDIA PROVIDERS (ADD TEXT AND TTS)
let freeMediaCode = fs.readFileSync('src/lib/ai/providers/free-media-provider.ts', 'utf8');

const newProviders = `
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
    return { text }
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
  readonly id = 'free-tts'
  isConfigured() { return true }
  getInfo() { return { id: this.id, name: 'Free Voice AI', isConfigured: true, capabilities: { streaming: false, vision: false, functionCalling: false, maxContextTokens: 0, supportedModels: ['google-tts'] } } }
  
  async synthesize(options: TTSOptions): Promise<TTSResult> {
    const encoded = encodeURIComponent(options.text.substring(0, 200))
    const url = \`https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=\${encoded}\`
    const res = await fetch(url)
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return {
      audioBuffer: buffer,
      mimeType: 'audio/mpeg',
      model: 'google-tts',
      provider: this.id
    }
  }
}
`

if (!freeMediaCode.includes('FreeTextProvider')) {
  freeMediaCode += newProviders;
  fs.writeFileSync('src/lib/ai/providers/free-media-provider.ts', freeMediaCode);
}

// 2. UPDATE ROUTER
let routerCode = fs.readFileSync('src/lib/ai/router.ts', 'utf8');
routerCode = routerCode.replace(/import \{ FreeImageProvider \} from '.\/providers\/free-media-provider'/, 
"import { FreeImageProvider, FreeTextProvider, FreeTTSProvider } from './providers/free-media-provider'");
routerCode = routerCode.replace(/return new GeminiTextProvider\(\)/, "return new FreeTextProvider()");
routerCode = routerCode.replace(/return new GeminiTTSProvider\(\)/, "return new FreeTTSProvider()");
fs.writeFileSync('src/lib/ai/router.ts', routerCode);

// 3. UPDATE REGEX in ROUTE.TS
let routeCode = fs.readFileSync('src/app/api/chat/route.ts', 'utf8');
routeCode = routeCode.replace(/const imageMatch = .*/, "const imageMatch = message.match(/(?:image|photo|pic) of (.*)/i) || message.match(/generate image\\s*(.*)/i)");
routeCode = routeCode.replace(/const videoMatch = .*/, "const videoMatch = message.match(/video of (.*)/i) || message.match(/generate video\\s*(.*)/i)");
routeCode = routeCode.replace(/const audioMatch = .*/, "const audioMatch = message.match(/(?:voice|audio|speak).* (?:of|saying|for) (.*)/i) || message.match(/voice of (.*)/i)");
fs.writeFileSync('src/app/api/chat/route.ts', routeCode);

console.log("All free providers integrated and regex fixed.");
