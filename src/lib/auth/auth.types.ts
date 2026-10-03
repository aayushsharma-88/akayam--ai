import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
  }
}

// Note: next-auth/jwt augmentation not used to avoid module resolution issues.
// JWT type is inferred from next-auth callbacks directly.

export type AuthUser = {
  id: string
  email: string
  name?: string | null
  image?: string | null
}
