import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { ProjectUpdateSchema, ProjectPatchSchema } from '@/lib/validations/project'
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
    const { errorResponse: authError } = await requireAuth(origin)
    if (authError) return authError

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
    if (error) {
      if (error.code === '23505') return errorResponse('Slug already exists', 409, origin)
      throw error
    }
    return jsonResponse(data, 200, origin)
  } catch (err) {
    console.error('[PUT /api/projects/:id]', err)
    return errorResponse('Failed to update project', 500, origin)
  }
}

function extractStoragePath(url: string | null | undefined, bucketName = 'project-images'): string | null {
  if (!url) return null
  const marker = `/${bucketName}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  const pathWithQuery = url.substring(idx + marker.length)
  return decodeURIComponent(pathWithQuery.split('?')[0])
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin')
  try {
    const { errorResponse: authError } = await requireAuth(origin)
    if (authError) return authError

    const { id } = await params
    const supabase = createServiceRoleClient()

    // 1. Fetch project before deletion to retrieve associated storage image paths
    const { data: project } = await supabase
      .from('projects')
      .select('id, image_url, gallery')
      .eq('id', id)
      .single()

    // 2. Delete row from database
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error

    // 3. Remove associated images from Supabase Storage
    if (project) {
      const pathsToDelete: string[] = []
      const mainPath = extractStoragePath(project.image_url)
      if (mainPath) pathsToDelete.push(mainPath)

      if (Array.isArray(project.gallery)) {
        project.gallery.forEach((g: any) => {
          const gPath = extractStoragePath(g?.image_url)
          if (gPath) pathsToDelete.push(gPath)
        })
      }

      if (pathsToDelete.length > 0) {
        const { error: storageErr } = await supabase.storage
          .from('project-images')
          .remove(pathsToDelete)
        if (storageErr) {
          console.error('[DELETE /api/projects/:id] Failed to delete storage files:', storageErr)
        }
      }
    }

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
    const { errorResponse: authError } = await requireAuth(origin)
    if (authError) return authError

    const { id } = await params
    const body = await request.json()
    const parsed = ProjectPatchSchema.safeParse(body)
    if (!parsed.success) {
      return jsonResponse({ error: 'Validation failed', issues: parsed.error.issues }, 422, origin)
    }
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase
      .from('projects')
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
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
