import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { getTTSProvider } from '@/lib/ai/router'
import { getStorage } from '@/lib/storage/storage'

export async function POST(req: Request) {
  try {
    const user = await requireAuth()
    const { messageId, text } = await req.json()

    if (!messageId && !text) {
      return NextResponse.json({ error: 'Message ID or text is required' }, { status: 400 })
    }

    // 1. Fetch message and check existing audio attachments (if messageId is provided)
    let messageContent = text || ''
    let dbMessage = null

    if (messageId) {
      dbMessage = await prisma.message.findUnique({
        where: { id: messageId },
        include: {
          attachments: { include: { file: true } },
          conversation: true,
        },
      })

      if (dbMessage) {
        if (dbMessage.conversation.userId !== user.id) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }
        messageContent = dbMessage.content
        
        // Check cache
        const existingAudio = dbMessage.attachments.find((a: any) => a.file.fileType === 'AUDIO')
        if (existingAudio) {
          return NextResponse.json({ 
            url: `/api/files/${existingAudio.fileId}` 
          })
        }
      }
    }

    if (!messageContent) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // 3. Generate new audio
    const ttsProvider = getTTSProvider()
    if (!ttsProvider.isConfigured()) {
      return NextResponse.json({ error: 'TTS provider is not configured. Please add GEMINI_API_KEY.' }, { status: 501 })
    }

    // Strip HTML and Markdown for cleaner reading
    let cleanText = messageContent
      .replace(/<[^>]+>/g, '') // Remove HTML tags
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Extract text from markdown links
      .replace(/[*_~`#]/g, '') // Remove common markdown symbols
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()

    // Gemini TTS has a limit of 4096 characters. Truncate safely.
    const textToSpeak = cleanText.substring(0, 4000)
    if (!textToSpeak.trim()) {
      return NextResponse.json({ error: 'Message is empty after cleaning' }, { status: 400 })
    }

    const ttsResult = await ttsProvider.synthesize({
      text: textToSpeak,
      voice: 'nova',
      speed: 1.0,
    })

    // 4. Save to storage
    const storage = getStorage()
    const fileId = `tts_${messageId || 'adhoc'}_${Date.now()}.mp3`
    const storedFile = await storage.put(`audio/${fileId}`, ttsResult.audioBuffer, ttsResult.mimeType)

    // Ensure the DB knows the file is inside 'uploads' for the local file server
    const baseDir = process.env.STORAGE_LOCAL_PATH ?? 'uploads'
    const actualStorageKey = `${baseDir}/${storedFile.key}`

    // 5. Save to DB
    const dbFile = await prisma.file.create({
      data: {
        userId: user.id,
        filename: fileId,
        originalName: 'tts_audio.mp3',
        mimeType: ttsResult.mimeType,
        size: storedFile.size,
        storageKey: actualStorageKey,
        fileType: 'AUDIO',
        status: 'READY',
      },
    })

    if (dbMessage) {
      await prisma.attachment.create({
        data: {
          messageId: dbMessage.id,
          fileId: dbFile.id,
        },
      })
    }

    return NextResponse.json({ 
      url: `/api/files/${dbFile.id}` 
    })

  } catch (error: any) {
    console.error('[POST /api/tts]', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate speech' }, 
      { status: 500 }
    )
  }
}
