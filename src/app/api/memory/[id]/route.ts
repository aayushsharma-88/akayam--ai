import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    await prisma.memory.delete({
      where: { id, userId: user.id }
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete memory' }, { status: 500 })
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
    const { isActive } = json
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Invalid active state' }, { status: 400 })
    }

    const memory = await prisma.memory.update({
      where: { id, userId: user.id },
      data: { isActive } // Assuming isActive exists on model
    })
    return NextResponse.json({ memory })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 })
  }
}
