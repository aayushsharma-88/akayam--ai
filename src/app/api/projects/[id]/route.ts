import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id, userId: user.id },
      include: {
        _count: { select: { conversations: true } },
        conversations: {
          orderBy: { updatedAt: 'desc' }
        },
        files: {
          orderBy: { createdAt: 'desc' }
        },
        generatedAssets: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    return NextResponse.json({ project })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const json = await req.json()
    const body = updateSchema.parse(json)

    const project = await prisma.project.update({
      where: { id, userId: user.id },
      data: body
    })
    return NextResponse.json({ project })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    await prisma.project.delete({
      where: { id, userId: user.id }
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
}
