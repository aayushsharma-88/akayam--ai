import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()

    const { id } = await params

    const file = await prisma.file.findUnique({
      where: { id }
    })
    
    if (!file) {
      return new NextResponse('Not found', { status: 404 })
    }
    
    if (file.userId !== user.id) {
      return new NextResponse('Unauthorized', { status: 403 })
    }
    
    const filePath = join(/*turbopackIgnore: true*/ process.cwd(), file.storageKey)
    const fileBuffer = await readFile(filePath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `inline; filename="${file.originalName}"`
      }
    })
  } catch (err) {
    console.error('[GET /api/files/:id]', err)
    return new NextResponse('Internal error', { status: 500 })
  }
}
