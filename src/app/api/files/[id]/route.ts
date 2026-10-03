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
    
    let fileBuffer: Buffer | null = null

    if (file.metadata && typeof file.metadata === 'object' && 'base64' in file.metadata) {
      fileBuffer = Buffer.from((file.metadata as any).base64, 'base64')
    } else {
      try {
        const filePath = join(/*turbopackIgnore: true*/ process.cwd(), file.storageKey)
        fileBuffer = await readFile(filePath)
      } catch (e) {
        console.error('Failed to read file from local storage', e)
      }
    }

    if (!fileBuffer) {
      return new NextResponse('File not found on server', { status: 404 })
    }
    
    return new NextResponse(fileBuffer as any, {
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
