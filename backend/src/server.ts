import cors from 'cors'
import express from 'express'
import { closeBrowser } from './browser.js'
import { generatePdfBuffer } from './pdf.js'

interface GeneratePdfBody {
  data?: unknown
  fileName?: unknown
  html?: unknown
  url?: unknown
}

function getAllowedTargetOrigins(): string[] {
  const rawOrigins = process.env.ALLOWED_TARGET_ORIGINS || ''

  return rawOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

function sanitizeFileName(input: string): string {
  const safeName = input
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const fileName = safeName || 'cv.pdf'
  return fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`
}

function isAllowedUrl(rawUrl: string, allowedOrigins: string[]): boolean {
  const parsedUrl = new URL(rawUrl)

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return false
  }

  if (allowedOrigins.length === 0) {
    return true
  }

  return allowedOrigins.includes(parsedUrl.origin)
}

const port = Number(process.env.PORT || 3001)
const frontendOrigin = process.env.FRONTEND_ORIGIN
const allowedTargetOrigins = getAllowedTargetOrigins()
const app = express()

if (frontendOrigin) {
  app.use(cors({ origin: frontendOrigin }))
}

app.use(express.json({ limit: '10mb' }))

app.get('/health', (_request, response) => {
  response.json({ ok: true })
})

app.post('/api/pdf/generate', async (request, response) => {
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
    response.send(pdfBuffer)
  } catch (error) {
    console.error('PDF generation failed.', error)
    response.status(500).json({ message: 'Failed to generate PDF.' })
  }
})

const server = app.listen(port, () => {
  console.log(`PDF service listening on http://localhost:${port}`)
})

async function shutdown(): Promise<void> {
  server.close()
  await closeBrowser()
}

process.on('SIGINT', () => {
  void shutdown().finally(() => process.exit(0))
})

process.on('SIGTERM', () => {
  void shutdown().finally(() => process.exit(0))
})
