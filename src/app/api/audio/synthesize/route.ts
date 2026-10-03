import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { z } from 'zod'

const ttsSchema = z.object({
  text: z.string().min(1).max(4096),
  voice: z.string().default('alloy'),
  speed: z.number().min(0.25).max(4.0).default(1.0)
})

import { getTTSProvider } from '@/lib/ai/router'

export async function POST(req: NextRequest) {
  try {
    await requireAuth()
    const json = await req.json()
    const { text, voice, speed } = ttsSchema.parse(json)
    
    const provider = getTTSProvider()
    if (!provider.isConfigured()) {
      return NextResponse.json({ error: 'TTS provider not configured' }, { status: 503 })
    }
    const result = await provider.synthesize({ text, voice, speed })
    const audioBuffer = result.audioBuffer
    
    return new NextResponse(audioBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'audio/mpeg',
      }
    })
  } catch (err) {
    console.error('[Synthesize API]', err)
    return NextResponse.json({ error: 'Synthesis failed' }, { status: 500 })
  }
}
