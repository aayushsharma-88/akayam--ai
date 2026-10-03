import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'ALL'
    
    const whereClause: Record<string, string> = { userId: user.id }
    if (type !== 'ALL') {
      whereClause.fileType = type
    }

    const files = await prisma.file.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const assets = files.map(file => ({
      id: file.id,
      name: file.originalName,
      type: file.mimeType,
      url: file.storageUrl,
      createdAt: file.createdAt.toISOString(),
      source: file.fileType
    }))

    return NextResponse.json({ assets })
  } catch (error) {
    console.error('[Library API GET]', error)
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}
