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

    const { id } = await params
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            attachments: true,
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    return NextResponse.json({ conversation })
  } catch (err) {
    const { id } = await params.catch(() => ({ id: 'unknown' }))
    console.error(`[GET /api/conversations/${id}]`, err)
    return NextResponse.json({ error: 'Failed to load conversation' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await req.json()
    const { title, isPinned, isArchived } = body

    const conversation = await prisma.conversation.findUnique({
      where: { id, userId: user.id },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(isPinned !== undefined ? { isPinned } : {}),
        ...(isArchived !== undefined ? { isArchived } : {}),
      },
    })

    return NextResponse.json({ conversation: updated })
  } catch (err) {
    const { id } = await params.catch(() => ({ id: 'unknown' }))
    console.error(`[PATCH /api/conversations/${id}]`, err)
    return NextResponse.json({ error: 'Failed to update conversation' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    
    const conversation = await prisma.conversation.findUnique({
      where: { id, userId: user.id },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    await prisma.conversation.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const { id } = await params.catch(() => ({ id: 'unknown' }))
    console.error(`[DELETE /api/conversations/${id}]`, err)
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 })
  }
}
