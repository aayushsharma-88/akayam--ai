import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json({ results: { conversations: [], messages: [] } })
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user.id,
        title: { contains: query } // simple LIKE search for stub
      },
      take: 10
    })

    const messages = await prisma.message.findMany({
      where: {
        conversation: { userId: user.id },
        content: { contains: query } // simple LIKE search for stub
      },
      take: 10,
      include: { conversation: { select: { title: true } } }
    })

    return NextResponse.json({
      results: {
        conversations,
        messages
      }
    })
  } catch (err) {
    console.error('[Search API]', err)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
