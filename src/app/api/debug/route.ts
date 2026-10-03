import { NextResponse } from 'next/server'
import { loadApiKeys } from '@/lib/ai/providers/gemini-provider'

export async function GET() {
  const keys = loadApiKeys()
  const maskedKeys = keys.map(k => k.substring(0, 4) + '...' + k.substring(k.length - 4))
  return NextResponse.json({
    totalKeysFound: keys.length,
    keys: maskedKeys,
  })
}
