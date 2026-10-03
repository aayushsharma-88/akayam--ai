import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

// GET /api/conversations — list user's conversations
export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const cursor = searchParams.get('cursor')
    const search = searchParams.get('search')

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user.id,
        isArchived: false,
        ...(search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        messages: {
          select: { id: true },
          take: 0, // just count
        },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = conversations.length > limit
    const data = hasMore ? conversations.slice(0, -1) : conversations

    return NextResponse.json({
      conversations: data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
    })
  } catch (err) {
    console.error('[GET /api/conversations]', err)
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 })
  }
}

// POST /api/conversations — create a new conversation
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const { title, projectId } = body as { title?: string; projectId?: string }

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: title ?? null,
        projectId: projectId ?? null,
      },
    })

    return NextResponse.json({ conversation })
  } catch (err) {
    console.error('[POST /api/conversations]', err)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
