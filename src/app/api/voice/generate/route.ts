import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { getStorage } from '@/lib/storage/storage'
import { getTTSProvider } from '@/lib/ai/router'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { text, voice } = await req.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Valid text is required' }, { status: 400 })
    }
    
    if (!voice || typeof voice !== 'string') {
      return NextResponse.json({ error: 'Voice is required' }, { status: 400 })
    }

    const textToSpeak = text.substring(0, 4000).trim()
    if (!textToSpeak) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 })
    }

    const hash = crypto.createHash('sha256').update(`${textToSpeak}-${voice}-gemini-v1.0`).digest('hex')
    const cacheKey = `tts_${hash}.mp3`
    const storagePath = `audio/voice/${cacheKey}`

    const existingFile = await prisma.file.findFirst({
      where: { storageKey: storagePath, fileType: 'AUDIO' }
    })

    if (existingFile) {
      return NextResponse.json({ 
        url: `/api/files/serve/${encodeURIComponent(existingFile.storageKey)}` 
      })
    }

    const ttsProvider = getTTSProvider()
    if (!ttsProvider.isConfigured()) {
      return NextResponse.json({ error: 'TTS provider is not configured. Please add GEMINI_API_KEY.' }, { status: 501 })
    }

    const ttsResult = await ttsProvider.synthesize({
      text: textToSpeak,
      voice: voice,
      speed: 1.0,
    })

    const storage = getStorage()
    const storedFile = await storage.put(storagePath, ttsResult.audioBuffer, ttsResult.mimeType)

    const dbFile = await prisma.file.create({
      data: {
        userId: user.id,
        filename: cacheKey,
        originalName: 'voice_generation.mp3',
        mimeType: ttsResult.mimeType,
        size: storedFile.size,
        storageKey: storagePath,
        fileType: 'AUDIO',
        status: 'READY',
      },
    })

    return NextResponse.json({ 
      url: `/api/files/serve/${encodeURIComponent(dbFile.storageKey)}` 
    })

  } catch (error: any) {
    console.error('[POST /api/voice/generate]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate voice' }, 
      { status: 500 }
    )
  }
}
