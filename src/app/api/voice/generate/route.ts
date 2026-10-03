import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { getStorage } from '@/lib/storage/storage'
import { getKokoroInstance, encodeWAV } from '@/lib/ai/providers/kokoro-local'
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

    // Truncate to reasonable length to prevent memory issues with local inference
    const textToSpeak = text.substring(0, 2000).trim()
    if (!textToSpeak) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 })
    }

    // 1. Check cache (using a hash of text + voice + version)
    const hash = crypto.createHash('sha256').update(`${textToSpeak}-${voice}-kokoro-v1.0`).digest('hex')
    const cacheKey = `tts_${hash}.wav`
    const storagePath = `audio/kokoro/${cacheKey}`

    // Check if we already have this exact audio in the DB (for this user, or globally)
    // We can just query the File table by filename/storageKey
    const existingFile = await prisma.file.findFirst({
      where: { storageKey: storagePath, fileType: 'AUDIO' }
    })

    if (existingFile) {
      return NextResponse.json({ 
        url: `/api/files/serve/${encodeURIComponent(existingFile.storageKey)}` 
      })
    }

    // 2. Generate new audio locally using Kokoro
    let audioData
    try {
      const tts = await getKokoroInstance()
      audioData = await tts.generate(textToSpeak, { voice })
    } catch (err: any) {
      console.error('[Kokoro Generation Error]', err)
      return NextResponse.json({ error: err.message || 'Failed to generate voice' }, { status: 500 })
    }

    if (!audioData || !audioData.audio) {
      return NextResponse.json({ error: 'Model produced no audio output' }, { status: 500 })
    }

    const pcm = audioData.audio
    const sampleRate = audioData.sampling_rate
    const wavBuffer = encodeWAV(pcm, sampleRate)

    // 3. Save to storage
    const storage = getStorage()
    const storedFile = await storage.put(storagePath, wavBuffer, 'audio/wav')

    // 4. Save to DB
    const dbFile = await prisma.file.create({
      data: {
        userId: user.id,
        filename: cacheKey,
        originalName: 'kokoro_voice.wav',
        mimeType: 'audio/wav',
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
