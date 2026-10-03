import type { VideoProvider } from './base-provider'
import type { VideoGenerationOptions, VideoGenerationResult, AIProviderInfo } from '../types'

export class FreeVideoProvider implements VideoProvider {
  readonly id = 'free-video'

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'YouTube Smart Search Video',
      isConfigured: true,
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: ['youtube-search'],
      }
    }
  }

  isConfigured(): boolean {
    return true
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    try {
      const query = options.prompt || 'random'
      const res = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      })
      const html = await res.text()
      const match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/)
      
      if (match) {
        return {
          jobId: 'instant-video-job',
          status: 'completed',
          // We pass the youtube embed URL
          videoUrl: `https://www.youtube.com/embed/${match[1]}?autoplay=0`,
          provider: this.id
        }
      }
      
      throw new Error('Could not find a matching video for this prompt.')
    } catch (err: any) {
      console.error('[FreeVideoProvider generateVideo Error]', err)
      throw err
    }
  }

  async getJobStatus(jobId: string): Promise<VideoGenerationResult> {
    return {
      jobId,
      status: 'completed',
      videoUrl: '',
      provider: this.id
    }
  }
}
