import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

export async function GET(_req: NextRequest) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const preferences = await prisma.userPreference.findUnique({
      where: { userId: user.id },
    })

    return NextResponse.json({ preferences: preferences ?? {} })
  } catch (err) {
    console.error('[GET /api/user/settings]', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json() as Record<string, unknown>
    const {
      theme, animationLevel, voiceEnabled, autoSpeak, voiceId,
      voiceSpeed, memoryEnabled, defaultModel, defaultProvider,
    } = body

    const data: Record<string, unknown> = {}
    if (theme !== undefined) data.theme = theme
    if (animationLevel !== undefined) data.animationLevel = animationLevel
    if (voiceEnabled !== undefined) data.voiceEnabled = voiceEnabled
    if (autoSpeak !== undefined) data.autoSpeak = autoSpeak
    if (voiceId !== undefined) data.voiceId = voiceId
    if (voiceSpeed !== undefined) data.voiceSpeed = voiceSpeed
    if (memoryEnabled !== undefined) data.memoryEnabled = memoryEnabled
    if (defaultModel !== undefined) data.defaultModel = defaultModel
    if (defaultProvider !== undefined) data.defaultProvider = defaultProvider

    const updated = await prisma.userPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: { ...data },
    })

    return NextResponse.json({ preferences: updated })
  } catch (err) {
    console.error('[PATCH /api/user/settings]', err)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
