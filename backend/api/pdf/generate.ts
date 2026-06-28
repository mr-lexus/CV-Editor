import { generatePdfBuffer } from '../../src/pdf.js'
import {
  type GeneratePdfBody,
  buildCorsHeaders,
  isAllowedOrigin,
  isAllowedUrl,
  readAllowedOrigins,
  sanitizeFileName,
} from '../../src/http.js'

type RequestLike = {
  method?: string
  body?: unknown
  headers: Record<string, string | string[] | undefined>
}

type ResponseLike = {
  setHeader(name: string, value: string): void
  status(code: number): ResponseLike
  json(body: unknown): void
  send(body: unknown): void
  end(body?: string): void
}

function readOriginHeader(headers: RequestLike['headers']): string | undefined {
  const header = headers.origin
  return Array.isArray(header) ? header[0] : header
}

function setCorsHeaders(response: ResponseLike, origin: string | undefined, allowedOrigins: string[]) {
  const headers = buildCorsHeaders(origin, allowedOrigins)

  Object.entries(headers).forEach(([name, value]) => {
    response.setHeader(name, value)
  })
}

export default async function handler(request: RequestLike, response: ResponseLike): Promise<void> {
  const frontendOrigins = readAllowedOrigins(process.env.FRONTEND_ORIGIN)
  const allowedTargetOrigins = readAllowedOrigins(process.env.ALLOWED_TARGET_ORIGINS)
  const requestOrigin = readOriginHeader(request.headers)

  setCorsHeaders(response, requestOrigin, frontendOrigins)

  if (request.method === 'OPTIONS') {
    response.status(204)
    response.end()
    return
  }

  if (request.method !== 'POST') {
    response.status(405).json({ message: 'Method not allowed.' })
    return
  }

  if (!isAllowedOrigin(requestOrigin, frontendOrigins)) {
    response.status(403).json({ message: 'Origin is not allowed by CORS.' })
    return
  }

  const body = (request.body || {}) as GeneratePdfBody
  const html = typeof body.html === 'string' && body.html.trim() ? body.html : undefined
  const url = typeof body.url === 'string' && body.url.trim() ? body.url : undefined

  if (!html && !url) {
    response.status(400).json({ message: 'Provide either html or url.' })
    return
  }

  if (url) {
    try {
      if (!isAllowedUrl(url, allowedTargetOrigins)) {
        response.status(400).json({ message: 'The provided URL is not allowed.' })
        return
      }
    } catch {
      response.status(400).json({ message: 'The provided URL is invalid.' })
      return
    }
  }

  try {
    const pdfBuffer = await generatePdfBuffer({ data: body.data, html, url })
    const fileName = sanitizeFileName(typeof body.fileName === 'string' ? body.fileName : 'cv.pdf')

    response.setHeader('Content-Type', 'application/pdf')
    response.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    response.setHeader('Content-Length', pdfBuffer.byteLength.toString())
    response.status(200)
    response.send(pdfBuffer)
  } catch (error) {
    console.error('PDF generation failed.', error)
    response.status(500).json({ message: 'Failed to generate PDF.' })
  }
}
