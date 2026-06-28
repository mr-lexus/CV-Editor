import cors from 'cors'
import express from 'express'
import { closeBrowser } from './browser.js'
import { generatePdfBuffer } from './pdf.js'
import {
  type GeneratePdfBody,
  isAllowedOrigin,
  isAllowedUrl,
  readAllowedOrigins,
  sanitizeFileName,
} from './http.js'

const port = Number(process.env.PORT || 3001)
const frontendOrigins = readAllowedOrigins(process.env.FRONTEND_ORIGIN)
const allowedTargetOrigins = readAllowedOrigins(process.env.ALLOWED_TARGET_ORIGINS)
const app = express()

app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin, frontendOrigins)) {
      callback(null, true)
      return
    }

    callback(new Error('Origin is not allowed by CORS.'))
  },
}))

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
