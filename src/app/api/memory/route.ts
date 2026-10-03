import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const memories = await prisma.memory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ memories })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch memories' }, { status: 500 })
  }
}

const createSchema = z.object({
  content: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const json = await req.json()
    const { content } = createSchema.parse(json)
    
    const memory = await prisma.memory.create({
      data: {
        content,
        userId: user.id,
      }
    })
    return NextResponse.json({ memory }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create memory' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth()
    await prisma.memory.deleteMany({
      where: { userId: user.id }
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to clear memories' }, { status: 500 })
  }
}
