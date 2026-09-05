import { createServiceRoleClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProjectInsertSchema } from '@/lib/validations/project'
import { handleOptions, jsonResponse, errorResponse, corsHeaders } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  return handleOptions(request)
}

// GET /api/projects - public, only published projects
export async function GET(request: Request) {
  const origin = request.headers.get('origin')
  try {
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return jsonResponse(data, 200, origin)
  } catch (err) {
    console.error('[GET /api/projects]', err)
    return errorResponse('Failed to fetch projects', 500, origin)
  }
}

// POST /api/projects - admin only
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  try {
    // Auth check
    const authClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401, origin)

    const body = await request.json()
    const parsed = ProjectInsertSchema.safeParse(body)
    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', issues: parsed.error.issues }, 422, origin)
    }

    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('projects')
      .insert(parsed.data)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return errorResponse('Slug already exists', 409, origin)
      throw error
    }
    return jsonResponse(data, 201, origin)
  } catch (err) {
    console.error('[POST /api/projects]', err)
    return errorResponse('Failed to create project', 500, origin)
  }
}
