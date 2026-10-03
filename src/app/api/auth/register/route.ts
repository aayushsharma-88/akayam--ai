import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth/auth-utils'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').refine(val => {
    // Basic protection against temp emails
    const forbiddenDomains = ['tempmail.com', '10minutemail.com', 'throwawaymail.com', 'guerrillamail.com']
    const domain = val.split('@')[1]
    return !forbiddenDomains.includes(domain)
  }, { message: "Please use a valid, permanent email address." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format. Must be a valid active phone number.'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RegisterSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }
    const { email, password, name, phone } = parsed.data
    await createUser(email, password, name, phone)
    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
