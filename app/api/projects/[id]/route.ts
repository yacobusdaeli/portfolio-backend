import { createServiceRoleClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProjectUpdateSchema } from '@/lib/validations/project'
import { handleOptions, jsonResponse, errorResponse } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  return handleOptions(request)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin')
  try {
    const { id } = await params
    const supabase = createServiceRoleClient()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    const query = supabase.from('projects').select('*').eq('published', true)
    const { data, error } = isUuid
      ? await query.eq('id', id).single()
      : await query.eq('slug', id).single()
    if (error || !data) return errorResponse('Project not found', 404, origin)
    return jsonResponse(data, 200, origin)
  } catch (err) {
    console.error('[GET /api/projects/:id]', err)
    return errorResponse('Failed to fetch project', 500, origin)
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin')
  try {
    const authClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401, origin)
    const { id } = await params
    const body = await request.json()
    const parsed = ProjectUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', issues: parsed.error.issues }, 422, origin)
    }
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('projects')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return jsonResponse(data, 200, origin)
  } catch (err) {
    console.error('[PUT /api/projects/:id]', err)
    return errorResponse('Failed to update project', 500, origin)
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin')
  try {
    const authClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401, origin)
    const { id } = await params
    const supabase = createServiceRoleClient()
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
    return jsonResponse({ success: true }, 200, origin)
  } catch (err) {
    console.error('[DELETE /api/projects/:id]', err)
    return errorResponse('Failed to delete project', 500, origin)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin')
  try {
    const authClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401, origin)
    const { id } = await params
    const body = await request.json()
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('projects')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, published, featured')
      .single()
    if (error) throw error
    return jsonResponse(data, 200, origin)
  } catch (err) {
    console.error('[PATCH /api/projects/:id]', err)
    return errorResponse('Failed to update project', 500, origin)
  }
}
