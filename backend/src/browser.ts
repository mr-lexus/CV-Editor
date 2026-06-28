import type { Browser } from 'puppeteer-core'

const localLaunchArgs = ['--no-sandbox', '--disable-setuid-sandbox']

let browserPromise: Promise<Browser> | null = null

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = await import('puppeteer-core')

    return puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  const puppeteer = await import('puppeteer')

  return puppeteer.default.launch({
    headless: true,
    args: localLaunchArgs,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  })
}

export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null
      throw error
    })
  }

  return browserPromise
}

export async function closeBrowser(): Promise<void> {
  if (!browserPromise) {
    return
  }

  const browser = await browserPromise
  browserPromise = null
  await browser.close()
}
