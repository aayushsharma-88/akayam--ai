/**
 * AKAYAM AI — Error Handling Utilities
 * Consistent error responses for API routes.
 */

export interface ApiError {
  error: string
  code?: string
  details?: unknown
}

export interface ApiSuccess<T = unknown> {
  data?: T
  message?: string
}

/** Format a caught error for API response */
export function formatError(err: unknown): string {
  if (err instanceof Error) {
    // Don't expose internal error details to users
    const message = err.message
    // Known user-facing errors
    if (message.includes('already exists')) return message
    if (message.includes('not found')) return message
    if (message.includes('not configured')) return message
    if (message.includes('API key')) return message
    if (message.includes('rate limit') || message.includes('rate_limit')) {
      return 'Rate limit reached. Please wait a moment and try again.'
    }
    if (message.includes('timeout') || message.includes('TIMEOUT')) {
      return 'The request timed out. Please try again.'
    }
  }
  // Generic fallback
  return 'Something went wrong. Please try again.'
}

/** Create a consistent error log prefix */
export function logError(route: string, err: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${route}]`, err)
  } else {
    // In production, log without sensitive data
    console.error(`[${route}]`, err instanceof Error ? err.message : 'Unknown error')
  }
}
