import { createServiceRoleClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { handleOptions, jsonResponse, errorResponse } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  return handleOptions(request)
}

// POST /api/upload - upload image for new or existing project using service role
export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  try {
    // Auth check using requireAuth helper
    const { errorResponse: authError } = await requireAuth(origin)
    if (authError) return authError

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folder = (formData.get('folder') as string) || 'uploads'

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg']
    const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png']

    if (!file) return errorResponse('No file provided', 400, origin)

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('Ukuran file melebihi batas maksimal 5MB', 400, origin)
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_MIME_TYPES.includes(file.type) || !ALLOWED_EXTENSIONS.includes(ext)) {
      return errorResponse('Format file tidak didukung. Hanya gambar format JPEG, JPG, dan PNG yang diperbolehkan', 400, origin)
    }

    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    const fileName = `${folder}/${Date.now()}-${cleanName}.${ext}`

    const supabase = createServiceRoleClient()
    const { error: uploadError } = await supabase.storage
      .from('project-images')
      .upload(fileName, file, { upsert: true, contentType: file.type })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('project-images')
      .getPublicUrl(fileName)

    return jsonResponse({ url: urlData.publicUrl, fileName }, 201, origin)
  } catch (err) {
    console.error('[POST /api/upload]', err)
    return errorResponse('Failed to upload image', 500, origin)
  }
}
