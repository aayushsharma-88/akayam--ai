import type {
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

export interface TextProvider {
  readonly id: string
  generateText(options: TextGenerationOptions): Promise<TextGenerationResult>
  streamText(options: TextGenerationOptions): AsyncGenerator<string>
  isConfigured(): boolean
  getInfo(): AIProviderInfo
}

export interface VisionProvider {
  readonly id: string
  analyzeImage(
    imageUrls: string[],
    prompt: string,
    conversationHistory?: AIMessage[]
  ): Promise<TextGenerationResult>
  streamAnalyzeImage(
    imageUrls: string[],
    prompt: string,
    conversationHistory?: AIMessage[]
  ): AsyncGenerator<string>
  isConfigured(): boolean
  getInfo(): AIProviderInfo
}

export interface ImageProvider {
  readonly id: string
  generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult>
  isConfigured(): boolean
  getInfo(): AIProviderInfo
}

export interface VideoProvider {
  readonly id: string
  generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult>
  getJobStatus(jobId: string): Promise<VideoGenerationResult>
  isConfigured(): boolean
  getInfo(): AIProviderInfo
}

export interface SpeechProvider {
  readonly id: string
  transcribe(options: TranscriptionOptions): Promise<TranscriptionResult>
  isConfigured(): boolean
  getInfo(): AIProviderInfo
}

export interface TTSProvider {
  readonly id: string
  synthesize(options: TTSOptions): Promise<TTSResult>
  getVoices(): Promise<Array<{ id: string; name: string; language: string }>>
  isConfigured(): boolean
  getInfo(): AIProviderInfo
}
