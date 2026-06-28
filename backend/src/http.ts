export interface GeneratePdfBody {
  data?: unknown
  fileName?: unknown
  html?: unknown
  url?: unknown
}

export function readAllowedOrigins(rawValue = ''): string[] {
  return rawValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function isAllowedOrigin(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (!origin || allowedOrigins.length === 0) {
    return true
  }

  return allowedOrigins.includes(origin)
}

export function buildCorsHeaders(origin: string | undefined, allowedOrigins: string[]): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (origin && isAllowedOrigin(origin, allowedOrigins)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return headers
}

export function sanitizeFileName(input: string): string {
  const safeName = input
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const fileName = safeName || 'cv.pdf'
  return fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
}

export function isAllowedUrl(rawUrl: string, allowedOrigins: string[]): boolean {
  const parsedUrl = new URL(rawUrl)

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return false
  }

  if (allowedOrigins.length === 0) {
    return true
  }

  return allowedOrigins.includes(parsedUrl.origin)
}
