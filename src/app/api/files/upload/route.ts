import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/auth-utils'
import { prisma } from '@/lib/db/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const MAX_FILE_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE ?? '52428800')

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/ogg',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm',
  'application/pdf',
  'text/plain', 'text/csv', 'text/markdown',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

function getFileType(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'DATA' | 'OTHER' {
  if (mimeType.startsWith('image/')) return 'IMAGE'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  if (mimeType.startsWith('audio/')) return 'AUDIO'
  if (['application/pdf', 'application/msword', 'text/plain', 'text/markdown'].some(t => mimeType.includes(t))) return 'DOCUMENT'
  if (['text/csv', 'application/json', 'application/vnd.ms-excel', 'spreadsheetml'].some(t => mimeType.includes(t))) return 'DATA'
  return 'OTHER'
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()
    
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB` },
        { status: 413 }
      )
    }
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not supported' },
        { status: 415 }
      )
    }
    
    // Save to local storage (configurable in prod)
    const storageProvider = process.env.STORAGE_PROVIDER ?? 'local'
    const fileId = randomUUID()
    const ext = extname(file.name)
    const filename = `${fileId}${ext}`
    const relativePath = `uploads/${user.id}/${filename}`
    
    if (storageProvider === 'local') {
      const uploadDir = join(process.cwd(), 'uploads', user.id)
      await mkdir(uploadDir, { recursive: true })
      const bytes = await file.arrayBuffer()
      await writeFile(join(process.cwd(), relativePath), Buffer.from(bytes))
    }
    
    const projectId = formData.get('projectId') as string | null
    
    const dbFile = await prisma.file.create({
      data: {
        userId: user.id,
        projectId: projectId || null,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        storageKey: relativePath,
        storageUrl: `/api/files/${fileId}`,
        fileType: getFileType(file.type),
        status: 'READY',
      },
    })
    
    return NextResponse.json({
      id: dbFile.id,
      name: file.name,
      type: file.type,
      size: file.size,
      url: `/api/files/${dbFile.id}`,
    })
  } catch (err) {
    console.error('[POST /api/files/upload]', err)
    return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
  }
}
