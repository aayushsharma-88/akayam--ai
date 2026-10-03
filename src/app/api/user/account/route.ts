import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth().catch(() => null)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Cascade delete in Prisma should handle most related entities if configured
    await prisma.user.delete({
      where: { id: user.id }
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/user/account]', err)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
