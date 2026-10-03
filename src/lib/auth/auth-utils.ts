/**
 * AKAYAM AI — Authentication Utilities
 * Server-side only. Never import in client components.
 */

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import type { AuthUser } from './auth.types'

/**
 * Get the currently authenticated user from session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const session = await auth()
    console.log('NextAuth session in Server Component:', JSON.stringify(session))
    if (!session?.user?.id) return null
    return {
      id: session.user.id,
      email: session.user.email!,
      name: session.user.name,
      image: session.user.image,
    }
  } catch (err) {
    console.error('auth() failed in Server Component:', err)
    return null
  }
}

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Use this at the top of protected server components/actions.
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    // Append a query param to bust aggressive browser caching of 307/308 redirects
    // from previous proxy middleware bugs, which causes ERR_TOO_MANY_REDIRECTS locally.
    redirect('/login?clear=1')
  }
  return user
}

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

/**
 * Verify a password against a hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a new user with email and password.
 * Also creates their profile and preferences.
 */
export async function createUser(
  email: string,
  password: string,
  name?: string,
  phone?: string
): Promise<{ id: string; email: string; name: string | null }> {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  })

  if (existing) {
    throw new Error('A user with this email already exists.')
  }

  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name?.trim() ?? null,
      password: hashedPassword,
      profile: {
        create: {
          displayName: name?.trim() ?? null,
        },
      },
      preferences: {
        create: {},
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  })

  return user
}
