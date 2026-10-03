const fs = require('fs');

// 1. Fix register page import
let pageTsx = fs.readFileSync('src/app/(auth)/register/page.tsx', 'utf8');
if (!pageTsx.includes('Phone')) {
  pageTsx = pageTsx.replace(/import \{ Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight \} from 'lucide-react'/, 
    "import { Mail, Lock, User, Phone, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'");
} else if (pageTsx.includes('lucide-react') && !pageTsx.match(/Phone.*lucide-react/)) {
  pageTsx = pageTsx.replace(/import \{([^}]+)\} from 'lucide-react'/, (match, p1) => {
    if (!p1.includes('Phone')) return `import { Phone, ${p1} } from 'lucide-react'`;
    return match;
  });
}
fs.writeFileSync('src/app/(auth)/register/page.tsx', pageTsx);

// 2. Fix free-media-provider.ts
let imageProv = `import type { ImageProvider } from './base-provider'
import type { ImageGenerationOptions, ImageGenerationResult, AIProviderInfo } from '../types'

export class FreeImageProvider implements ImageProvider {
  readonly id = 'free-image'

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Pollinations Free Image',
      isConfigured: true,
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: ['pollinations-flux'],
      }
    }
  }

  isConfigured(): boolean {
    return true
  }

  async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
      const encodedPrompt = encodeURIComponent(options.prompt || 'random art')
      const seed = Math.floor(Math.random() * 1000000)
      const url = \`https://image.pollinations.ai/prompt/\${encodedPrompt}?width=1024&height=1024&nologo=true&seed=\${seed}\`
      
      return {
        images: [{ url }],
        provider: this.id,
        model: 'pollinations-flux'
      }
    } catch (err: any) {
      console.error('[FreeImageProvider generateImage Error]', err)
      throw err
    }
  }
}
`
fs.writeFileSync('src/lib/ai/providers/free-media-provider.ts', imageProv);

// 3. Fix free-video-provider.ts
let videoProv = `import type { VideoProvider } from './base-provider'
import type { VideoGenerationOptions, VideoGenerationResult, AIProviderInfo } from '../types'

export class FreeVideoProvider implements VideoProvider {
  readonly id = 'free-video'

  getInfo(): AIProviderInfo {
    return {
      id: this.id,
      name: 'Smart Video Search (Jugaad)',
      isConfigured: true,
      capabilities: {
        streaming: false,
        vision: false,
        functionCalling: false,
        maxContextTokens: 0,
        supportedModels: ['giphy-smart-search'],
      }
    }
  }

  isConfigured(): boolean {
    return true
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    try {
      const query = options.prompt || 'random'
      const url = \`https://giphy.com/search/\${encodeURIComponent(query).replace(/%20/g, '-')}\`
      
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      const html = await res.text()
      const match = html.match(/https:\\/\\/[^"'\\s]+\\.mp4/)
      
      if (match) {
        return {
          jobId: 'instant-video-job',
          status: 'completed',
          videoUrl: match[0],
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
`
fs.writeFileSync('src/lib/ai/providers/free-video-provider.ts', videoProv);

console.log("Fixed TS Errors");
