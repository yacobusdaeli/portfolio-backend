import { createServerSupabaseClient } from '@/lib/supabase/server'
import { errorResponse } from '@/lib/cors'
import type { User } from '@supabase/supabase-js'
import type { NextResponse } from 'next/server'

export type AuthResult =
  | { user: User; errorResponse: null }
  | { user: null; errorResponse: NextResponse }

/**
 * Reusable helper to verify admin authentication in API route handlers.
 * Returns { user, errorResponse: null } if authorized, or { user: null, errorResponse } if not.
 *
 * Usage:
 * ```ts
 * const { user, errorResponse: authError } = await requireAuth(origin)
 * if (authError) return authError
 * ```
 */
export async function requireAuth(origin: string | null = null): Promise<AuthResult> {
  try {
    const authClient = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser()

    if (authError || !user) {
      return {
        user: null,
        errorResponse: errorResponse('Unauthorized', 401, origin),
      }
    }

    return { user, errorResponse: null }
  } catch (err) {
    console.error('[requireAuth] Unexpected error:', err)
    return {
      user: null,
      errorResponse: errorResponse('Unauthorized', 401, origin),
    }
  }
}
