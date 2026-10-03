import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const asset = await prisma.generatedAsset.findFirst({
      where: { id, userId: user.id },
    })
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.generatedAsset.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/library/[id]]', err)
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 })
  }
}
