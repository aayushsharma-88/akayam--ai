import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { getImageProvider } from '@/lib/ai/router'
import { z } from 'zod'

const ImageGenSchema = z.object({
  prompt: z.string().min(1).max(4000),
  width: z.number().optional(),
  height: z.number().optional(),
  quality: z.enum(['standard', 'hd']).optional(),
  conversationId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await req.json()
    const parsed = ImageGenSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }

    const provider = getImageProvider()
    if (!provider.isConfigured()) {
      return NextResponse.json(
        { error: 'Image generation is unavailable because no image-generation provider is configured. Please add an API key (e.g., GEMINI_API_KEY).' }, 
        { status: 503 }
      )
    }

    const result = await provider.generateImage({
      prompt: parsed.data.prompt,
      width: parsed.data.width,
      height: parsed.data.height,
      quality: parsed.data.quality,
    })

    // Save to generated assets
    const asset = await prisma.generatedAsset.create({
      data: {
        userId: user.id,
        type: 'IMAGE',
        provider: result.provider,
        model: result.model,
        prompt: parsed.data.prompt,
        status: 'COMPLETED',
        storageUrl: result.images[0]?.url ?? null,
        completedAt: new Date(),
      },
    })

    return NextResponse.json({ images: result.images, assetId: asset.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image generation failed'
    console.error('[POST /api/images/generate]', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
