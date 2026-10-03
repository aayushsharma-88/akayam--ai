import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'

import { getSpeechProvider } from '@/lib/ai/router'

export async function POST(req: NextRequest) {
  try {
    await requireAuth()
    
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }
    
    const provider = getSpeechProvider()
    if (!provider.isConfigured()) {
      return NextResponse.json({ text: 'Transcription is unavailable because no speech-to-text provider is configured. Please configure an API key.' })
    }
    const arrayBuffer = await file.arrayBuffer()
    const result = await provider.transcribe({
      audioBuffer: Buffer.from(arrayBuffer),
      mimeType: file.type,
      filename: file.name,
    })
    const text = result.text
    
    return NextResponse.json({ text })
  } catch (err) {
    console.error('[Transcribe API]', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
