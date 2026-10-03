import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true, email: true, image: true }
    })
    return NextResponse.json({ user: profile })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  image: z.string().url().optional().nullable(),
})

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth()
    const json = await req.json()
    const body = updateSchema.parse(json)
    
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: body,
      select: { id: true, name: true, email: true, image: true }
    })
    return NextResponse.json({ profile: updated })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
