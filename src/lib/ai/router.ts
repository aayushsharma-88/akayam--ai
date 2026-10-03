import { FreeVideoProvider } from './providers/free-video-provider'
import { FreeImageProvider, FreeTextProvider, FreeTTSProvider } from './providers/free-media-provider'
/**
 * AKAYAM AI — AI Provider Router
 * Selects and returns the appropriate AI provider based on configuration.
 */

import {
  GeminiTextProvider,
  GeminiVisionProvider,
  GeminiImageProvider,
  GeminiSpeechProvider,
  GeminiTTSProvider,
  GeminiVideoProvider,
} from './providers/gemini-provider'
import type {
  TextProvider,
  VisionProvider,
  ImageProvider,
  VideoProvider,
  SpeechProvider,
  TTSProvider,
} from './providers/base-provider'
import type { AIProviderInfo } from './types'

/**
 * A stub video provider for when no video provider is configured.
 * Allows the app to start without crashing.
 */
class UnconfiguredVideoProvider implements VideoProvider {
  readonly id = 'unconfigured'

  isConfigured() { return false }

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Video Generation (Not Configured)',
      isConfigured: false,
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: [],
      },
    }
  }

  async generateVideo(_options: import('./types').VideoGenerationOptions): Promise<import('./types').VideoGenerationResult> {
    throw new Error(
      'Video generation provider is not configured. Please see .env.example for configuration options.'
    )
  }

  async getJobStatus(jobId: string) {
    return {
      jobId,
      status: 'failed' as const,
      provider: this.id,
      error: 'Video provider not configured',
    }
  }
}

/** Get the configured text provider */
export function getTextProvider(): TextProvider {
  return new GeminiTextProvider()
}

/** Get the configured vision provider */
export function getVisionProvider(): VisionProvider {
  return new GeminiVisionProvider()
}



/** Get the configured image generation provider */
export function getImageProvider(): ImageProvider {
  return new FreeImageProvider()
}



/** Get the configured video generation provider */
export function getVideoProvider(): VideoProvider {
  return new FreeVideoProvider()
}

/** Get the configured speech-to-text provider */
export function getSpeechProvider(): SpeechProvider {
  return new GeminiSpeechProvider()
}

/** Get the configured text-to-speech provider */
export function getTTSProvider(): TTSProvider {
  return new FreeTTSProvider()
}

/** Get status of all configured providers */
export function getAllProviderStatus(): AIProviderInfo[] {
  return [
    getTextProvider().getInfo(),
    getVisionProvider().getInfo(),
    getImageProvider().getInfo(),
    getVideoProvider().getInfo(),
    getSpeechProvider().getInfo(),
    getTTSProvider().getInfo(),
  ]
}
