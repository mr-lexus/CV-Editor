import { getBrowser } from './browser.js'

interface GeneratePdfOptions {
  data?: unknown
  html?: string
  url?: string
}

export async function generatePdfBuffer({ data, html, url }: GeneratePdfOptions): Promise<Buffer> {
  const browser = await getBrowser()
  const page = await browser.newPage()

  try {
    await page.setViewport({
      width: 1240,
      height: 1754,
      deviceScaleFactor: 1,
    })

    if (data) {
      await page.evaluateOnNewDocument((injectedData) => {
        ;(window as Window & { __CV_PRINT_DATA__?: unknown }).__CV_PRINT_DATA__ = injectedData
      }, data)
    }

    if (url) {
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      })
    } else if (html) {
      await page.setContent(html, {
        waitUntil: 'domcontentloaded',
      })
    } else {
      throw new Error('Either html or url must be provided.')
    }

    await page.waitForNetworkIdle().catch(() => undefined)
    await page.emulateMediaType('screen')
    await page.waitForFunction(() => Boolean(document.querySelector('#cv-document')), {
      timeout: 10000,
    })
    await page.evaluate(async () => {
      if ('fonts' in document) {
        await document.fonts.ready
      }

      const images = Array.from(document.images)
      await Promise.all(
        images.map(async (image) => {
          if (!image.complete) {
            await new Promise<void>((resolve) => {
              const done = () => resolve()
              image.addEventListener('load', done, { once: true })
              image.addEventListener('error', done, { once: true })
            })
          }

          if ('decode' in image) {
            await image.decode().catch(() => undefined)
          }
        }),
      )

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve())
        })
      })
    })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '8mm',
        right: '8mm',
        bottom: '8mm',
        left: '8mm',
      },
    })

    return Buffer.from(pdf)
  } finally {
    await page.close()
  }
}
