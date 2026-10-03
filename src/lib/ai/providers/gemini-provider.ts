import {
  TextGenerationOptions,
  TextGenerationResult,
  ImageGenerationOptions,
  ImageGenerationResult,
  VideoGenerationOptions,
  VideoGenerationResult,
  TranscriptionOptions,
  TranscriptionResult,
  TTSOptions,
  TTSResult,
  AIMessage,
  AIProviderInfo,
} from '@/lib/ai/types'

import { TextProvider, VisionProvider, ImageProvider, VideoProvider, SpeechProvider, TTSProvider } from './base-provider'
import { GoogleGenAI } from '@google/genai'

const DEFAULT_TEXT_MODEL = 'gemini-3.6-flash'
const DEFAULT_IMAGE_MODEL = 'nano-banana-pro-preview'
const DEFAULT_VIDEO_MODEL = 'veo-3.1-generate-preview'
const DEFAULT_TTS_MODEL = 'gemini-3.8-flash-tts'

export class GeminiProviderError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'GeminiProviderError'
  }
}

function getApiKey(): string | undefined {
  let key = process.env.GEMINI_API_KEY
  if (key) {
    key = key.trim()
    if (key.startsWith('"') && key.endsWith('"')) {
      key = key.slice(1, -1).trim()
    }
  }
  return key
}

function getClient() {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new GeminiProviderError('Gemini API key is not configured.')
  }
  return new GoogleGenAI({ apiKey })
}

function formatMessages(messages: AIMessage[]): Array<{ role: string; parts: Array<{ text?: string; inlineData?: any }> }> {
  return messages.map(msg => {
    let parts: any[] = []
    if (typeof msg.content === 'string') {
      parts = [{ text: msg.content }]
    } else {
      parts = msg.content.map(c => {
        if (c.type === 'text') return { text: c.text }
        
        const url = c.image_url?.url || c.file_url?.url
        if (url && url.startsWith('data:')) {
          const match = url.match(/^data:([^;]+);base64,(.+)$/)
          if (match) {
            return {
              inlineData: {
                mimeType: match[1],
                data: match[2]
              }
            }
          }
        }
        
        if (url) {
          return { text: `[External File/Image: ${url}]` }
        }
        return { text: '' }
      })
    }
    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts,
    }
  })
}

// "?"?"? TEXT PROVIDER "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

export class GeminiTextProvider implements TextProvider {
  readonly id = 'gemini'

  isConfigured(): boolean {
    return !!getApiKey()
  }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Google Gemini',
      isConfigured: this.isConfigured(),
      capabilities: {
        streaming: true,
        vision: true,
        functionCalling: false,
        maxContextTokens: 1048576,
        supportedModels: ['gemini-3.8-flash', 'gemini-3.8-pro'],
      },
    }
  }

  async generateText(options: TextGenerationOptions): Promise<TextGenerationResult> {
    const ai = getClient()
    const model = options.model ?? DEFAULT_TEXT_MODEL

    try {
      const response = await ai.models.generateContent({
        model,
        contents: formatMessages(options.messages),
        config: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8192,
          systemInstruction: options.systemPrompt,
        }
      })

      return {
        text: response.text ?? '',
        model,
        provider: this.id,
      }
    } catch (err: any) {
      console.error('[Gemini generateText Error]', err)
      throw new GeminiProviderError(err.message, err.status?.toString())
    }
  }

    async *streamText(options: TextGenerationOptions): AsyncGenerator<string> {
    const ai = getClient()
    const model = options.model ?? DEFAULT_TEXT_MODEL
    const fallbackModel = 'gemini-flash-latest'

    let responseStream;
    let usedFallback = false;

    // Timeout helper
    const withTimeout = (promise: Promise<any>, ms: number) => {
      let timeout: NodeJS.Timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error('TIMEOUT')), ms);
      });
      return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
    };

    try {
      // try primary model with 10s timeout
      responseStream = await withTimeout(ai.models.generateContentStream({
        model,
        contents: formatMessages(options.messages),
        config: {
          systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 8192,
        }
      }), 15000);
    } catch (err: any) {
      if (err.message === 'TIMEOUT' || String(err.status) === '503' || String(err.status) === 'Service Unavailable' || String(err.code) === '503' || (err.message && err.message.includes('503')) || (err.message && err.message.includes('UNAVAILABLE'))) {
        console.warn('Primary model failed (timeout or 503), trying fallback:', fallbackModel);
        try {
          usedFallback = true;
          responseStream = await withTimeout(ai.models.generateContentStream({
            model: fallbackModel,
            contents: formatMessages(options.messages),
            config: {
              systemInstruction: options.systemPrompt ? { parts: [{ text: options.systemPrompt }] } : undefined,
              temperature: options.temperature ?? 0.7,
              maxOutputTokens: options.maxTokens ?? 8192,
            }
          }), 15000);
        } catch (err2: any) {
           throw new GeminiProviderError(err2.message || 'Stream timeout', err2.status?.toString());
        }
      } else {
        throw new GeminiProviderError(err.message, err.status?.toString())
      }
    }

    try {
      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield chunk.text
        }
      }
    } catch (err: any) {
      throw new GeminiProviderError(err.message, err.status?.toString())
    }
  }
  }

  export class GeminiVisionProvider implements VisionProvider {
  readonly id = 'gemini'
  private textProvider = new GeminiTextProvider()

  isConfigured(): boolean {
    return !!getApiKey()
  }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Google Gemini Vision',
      isConfigured: this.isConfigured(),
      capabilities: {
        streaming: true,
        vision: true,
        functionCalling: false,
        maxContextTokens: 1048576,
        supportedModels: ['gemini-3.8-flash', 'gemini-3.8-pro'],
      },
    }
  }

  async analyzeImage(
    imageUrls: string[],
    prompt: string,
    conversationHistory: AIMessage[] = []
  ): Promise<TextGenerationResult> {
    const imageContent = imageUrls.map(url => ({
      type: 'image_url' as const,
      image_url: { url, detail: 'auto' as const },
    }))

    const userMessage: AIMessage = {
      role: 'user',
      content: [
        ...imageContent,
        { type: 'text', text: prompt },
      ],
    }

    return this.textProvider.generateText({
      model: DEFAULT_TEXT_MODEL,
      messages: [...conversationHistory, userMessage],
      systemPrompt: 'You are Akayam, an advanced AI assistant with vision capabilities. Analyze images thoughtfully.',
    })
  }

  async *streamAnalyzeImage(
    imageUrls: string[],
    prompt: string,
    conversationHistory: AIMessage[] = []
  ): AsyncGenerator<string> {
    const imageContent = imageUrls.map(url => ({
      type: 'image_url' as const,
      image_url: { url, detail: 'auto' as const },
    }))

    const userMessage: AIMessage = {
      role: 'user',
      content: [
        ...imageContent,
        { type: 'text', text: prompt },
      ],
    }

    yield* this.textProvider.streamText({
      model: DEFAULT_TEXT_MODEL,
      messages: [...conversationHistory, userMessage],
      systemPrompt: 'You are Akayam, an advanced AI assistant with vision capabilities. Analyze images thoughtfully.',
      stream: true,
    })
  }
}

// "?"?"? IMAGE GENERATION PROVIDER "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

export class GeminiImageProvider implements ImageProvider {
  readonly id = 'gemini'

  isConfigured(): boolean {
    return !!getApiKey()
  }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Gemini Image Generation',
      isConfigured: this.isConfigured(),
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: [DEFAULT_IMAGE_MODEL],
      },
    }
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const ai = getClient()
    try {
      const response = await ai.models.generateContent({
        model: DEFAULT_IMAGE_MODEL,
        contents: options.prompt,
        config: {
          responseMimeType: 'image/jpeg',
        }
      })
      
      let base64 = ''
      if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
        base64 = response.candidates[0].content.parts[0].inlineData.data
      }

      return {
        images: [{ url: '', base64 }],
        model: DEFAULT_IMAGE_MODEL,
        provider: this.id,
      }
    } catch (err: any) {
      console.error('[Gemini generateImage Error]', err)
      throw new GeminiProviderError(err.message, err.status?.toString())
    }
  }
}

// "?"?"? SPEECH-TO-TEXT PROVIDER "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

export class GeminiSpeechProvider implements SpeechProvider {
  readonly id = 'gemini'

  isConfigured(): boolean {
    return !!getApiKey()
  }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Gemini Speech-to-Text',
      isConfigured: this.isConfigured(),
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: ['gemini-3.8-flash'],
      },
    }
  }

  async transcribe(options: TranscriptionOptions): Promise<TranscriptionResult> {
    const ai = getClient()
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType: options.mimeType ?? 'audio/mp3', data: options.audioBuffer.toString('base64') } },
              { text: 'Transcribe this audio precisely.' }
            ]
          }
        ]
      })

      return {
        text: response.text ?? '',
        provider: this.id,
      }
    } catch (err: any) {
      console.error('[Gemini transcribe Error]', err)
      throw new GeminiProviderError(err.message, err.status?.toString())
    }
  }
}

// "?"?"? TEXT-TO-SPEECH PROVIDER "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

export class GeminiTTSProvider implements TTSProvider {
  readonly id = 'gemini'

  isConfigured(): boolean {
    return !!getApiKey()
  }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Gemini TTS',
      isConfigured: this.isConfigured(),
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: [DEFAULT_TTS_MODEL],
      },
    }
  }

  async synthesize(options: TTSOptions): Promise<TTSResult> {
    const ai = getClient()
    try {
      const response = await ai.models.generateContent({
        model: options.model ?? DEFAULT_TTS_MODEL,
        contents: options.text,
        config: {
          responseMimeType: 'audio/mp3',
        }
      })

      let audioData = ''
      if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
        audioData = response.candidates[0].content.parts[0].inlineData.data
      } else {
        throw new GeminiProviderError('No audio data received')
      }

      return {
        audioBuffer: Buffer.from(audioData, 'base64'),
        mimeType: 'audio/mp3',
        provider: this.id,
      }
    } catch (err: any) {
      console.error('[Gemini TTS Error]', err)
      throw new GeminiProviderError(err.message, err.status?.toString())
    }
  }

  async getVoices(): Promise<Array<{ id: string; name: string; language: string }>> {
    return [
      { id: 'default', name: 'Gemini Voice', language: 'en' }
    ]
  }
}

// "?"?"? VIDEO PROVIDER "?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?"?

export class GeminiVideoProvider implements VideoProvider {
  readonly id = 'gemini'

  isConfigured(): boolean {
    return !!getApiKey()
  }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Gemini Video Generation',
      isConfigured: this.isConfigured(),
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: [DEFAULT_VIDEO_MODEL],
      },
    }
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    const ai = getClient()
    try {
      const response = await ai.models.generateVideos({
        model: DEFAULT_VIDEO_MODEL,
        source: {
          prompt: options.prompt
        },
      })

      return {
        jobId: (response as any).name ?? 'unknown',
        status: 'processing',
        provider: this.id,
      }
    } catch (err: any) {
      console.error('[Gemini generateVideo Error]', err)
      throw new GeminiProviderError(err.message, err.status?.toString())
    }
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResult> {
    const ai = getClient()
    try {
      const operation = await ai.operations.get({ operation: { name: jobId } } as any)
      if ((operation as any).done) {
        let videoUrl = ''
        if ((operation as any).response?.videoUri) {
          videoUrl = (operation as any).response.videoUri
        }
        return {
          jobId,
          status: 'completed',
          videoUrl,
          provider: this.id,
        }
      } else {
        return {
          jobId,
          status: 'processing',
          provider: this.id,
        }
      }
    } catch (err: any) {
      console.error('[Gemini getJobStatus Error]', err)
      return {
        jobId,
        status: 'failed',
        error: err.message,
        provider: this.id,
      }
    }
  }
}
