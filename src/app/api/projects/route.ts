import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { conversations: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    return NextResponse.json({ projects })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable()
})

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    const json = await req.json()
    const body = createSchema.parse(json)
    
    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        userId: user.id
      }
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}
