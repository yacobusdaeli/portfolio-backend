import { createServiceRoleClient } from '@/lib/supabase/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { handleOptions, jsonResponse, errorResponse } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  return handleOptions(request)
}

// POST /api/projects/[id]/image — upload image to Supabase Storage
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const origin = request.headers.get('origin')
  try {
    // Auth check
    const authClient = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) return errorResponse('Unauthorized', 401, origin)

    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = (formData.get('type') as string) || 'main' // 'main' or 'gallery'
    const galleryId = formData.get('galleryId') as string | null

    if (!file) return errorResponse('No file provided', 400, origin)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = type === 'gallery' && galleryId
      ? `gallery/${id}-${galleryId}.${ext}`
      : `${id}-main.${ext}`

    const supabase = createServiceRoleClient()
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName)

    return jsonResponse({ url: urlData.publicUrl }, 201, origin)
  } catch (err) {
    console.error('[POST /api/projects/:id/image]', err)
    return errorResponse('Failed to upload image', 500, origin)
  }
}
