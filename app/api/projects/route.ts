import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { ProjectInsertSchema } from '@/lib/validations/project'
import { handleOptions, jsonResponse, errorResponse } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  return handleOptions(request)
}

// GET /api/projects - public, only published projects (summary list for portfolio)
// Supports: ?featured=true, ?tag=react, ?q=keywords, ?sort=order|latest|oldest|title, ?limit=10&page=1, ?all=true
export async function GET(request: Request) {
  const origin = request.headers.get('origin')
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const tag = searchParams.get('tag')
    const allFields = searchParams.get('all') === 'true'
    const q = searchParams.get('q') || searchParams.get('search')
    const sort = searchParams.get('sort') || 'order'
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')

    const isPaginated = pageParam !== null || limitParam !== null
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1)
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '10', 10) || 10))
    const from = (page - 1) * limit
    const to = from + limit - 1

    const SUMMARY_FIELDS = 'id, slug, title, subtitle, badge, image_url, tags, technologies, demo_url, github_url, featured, order_index, created_at'

    const supabase = createServiceRoleClient()
    let query = supabase
      .from('projects')
      .select(allFields ? '*' : SUMMARY_FIELDS, { count: 'exact' })
      .eq('published', true)

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (q && q.trim()) {
      const cleanQ = q.trim().replace(/[%_,()]/g, ' ')
      query = query.or(`title.ilike.%${cleanQ}%,subtitle.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`)
    }

    // Sorting
    switch (sort) {
      case 'latest':
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'title':
        query = query.order('title', { ascending: true })
        break
      case 'order':
      default:
        query = query
          .order('order_index', { ascending: true })
          .order('created_at', { ascending: false })
        break
    }

    if (isPaginated) {
      query = query.range(from, to)
      const { data, count, error } = await query
      if (error) throw error

      const total = count ?? (data?.length || 0)
      return jsonResponse({
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      }, 200, origin)
    }

    const { data, error } = await query
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
    // Auth check using requireAuth helper
    const { errorResponse: authError } = await requireAuth(origin)
    if (authError) return authError

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
