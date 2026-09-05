import { NextResponse } from 'next/server'

export function corsHeaders(origin: string | null) {
  const allowed = (process.env.CORS_ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim())
  const isAllowed = !origin || allowed.includes(origin) || allowed.includes('*')
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin ?? '*') : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

export function handleOptions(request: Request) {
  const origin = request.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

export function jsonResponse(data: unknown, status = 200, origin: string | null = null) {
  return NextResponse.json(data, {
    status,
    headers: corsHeaders(origin),
  })
}

export function errorResponse(message: string, status = 400, origin: string | null = null) {
  return jsonResponse({ error: message }, status, origin)
}
