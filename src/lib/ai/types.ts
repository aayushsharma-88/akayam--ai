/**
 * AKAYAM AI — AI Provider Type Definitions
 * These types form the contract for all AI provider implementations.
 */

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | AIMessageContent[]
}

export interface AIMessageContent {
  type: 'text' | 'image_url' | 'audio' | 'file_url'
  text?: string
  image_url?: {
    url: string
    detail?: 'low' | 'high' | 'auto'
  }
  file_url?: {
    url: string
  }
}

export interface TextGenerationOptions {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  systemPrompt?: string
  messages: AIMessage[]
}

export interface ImageGenerationOptions {
  prompt: string
  negativePrompt?: string
  width?: number
  height?: number
  count?: number
  style?: string
  referenceImageUrl?: string
  quality?: 'standard' | 'hd'
}

export interface VideoGenerationOptions {
  prompt: string
  imageUrl?: string
  duration?: number
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3'
  style?: string
}

export interface TranscriptionOptions {
  audioBuffer: Buffer
  language?: string
  mimeType?: string
  filename?: string
}

export interface TTSOptions {
  text: string
  voice?: string
  speed?: number
  model?: string
}

export interface TextGenerationResult {
  text: string
  inputTokens?: number
  outputTokens?: number
  model: string
  provider: string
}

export interface ImageGenerationResult {
  images: Array<{ url: string; base64?: string; revisedPrompt?: string }>
  model: string
  provider: string
}

export interface VideoGenerationResult {
  jobId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  thumbnailUrl?: string
  progress?: number
  provider: string
  error?: string
}

export interface TranscriptionResult {
  text: string
  language?: string
  duration?: number
  segments?: Array<{ start: number; end: number; text: string }>
  provider: string
}

export interface TTSResult {
  audioBuffer: Buffer
  mimeType: string
  provider: string
}

export interface ProviderCapabilities {
  streaming: boolean
  vision: boolean
  functionCalling: boolean
  maxContextTokens: number
  supportedModels: string[]
}

export interface AIProviderInfo {
  id: string
  name: string
  isConfigured: boolean
  capabilities: ProviderCapabilities
}

export interface AnalysisResult {
  content: string
  insights?: string[]
  metadata?: Record<string, unknown>
}

export type ProviderType =
  | 'text'
  | 'vision'
  | 'image'
  | 'video'
  | 'speech'
  | 'tts'
  | 'embedding'

export interface AIError {
  code: string
  message: string
  provider?: string
  retryable?: boolean
}
