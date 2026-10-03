import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: conversationId } = await params

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId: user.id },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        attachments: true,
      },
    })

    return NextResponse.json({ messages })
  } catch (err) {
    const { id } = await params.catch(() => ({ id: 'unknown' }))
    console.error(`[GET /api/conversations/${id}/messages]`, err)
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: conversationId } = await params
    const body = await req.json()
    const { role, content, contentType, model } = body

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId, userId: user.id },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        role: role ?? 'USER',
        content,
        contentType: contentType ?? 'TEXT',
        model,
      },
      include: {
        attachments: true,
      }
    })

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ message })
  } catch (err) {
    const { id } = await params.catch(() => ({ id: 'unknown' }))
    console.error(`[POST /api/conversations/${id}/messages]`, err)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
