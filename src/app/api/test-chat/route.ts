import { NextResponse } from 'next/server'
import { getTextProvider } from '@/lib/ai/router'

export async function GET() {
  try {
    const provider = getTextProvider()
    const result = await provider.generateText({
      model: 'gemini-3.8-flash',
      messages: [{ role: 'user', content: 'Hello, introduce yourself.' }],
      maxTokens: 50
    })
    return NextResponse.json({ success: true, result: result.text })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
