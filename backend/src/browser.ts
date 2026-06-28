import puppeteer, { type Browser } from 'puppeteer'

const launchArgs = ['--no-sandbox', '--disable-setuid-sandbox']

let browserPromise: Promise<Browser> | null = null

export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: launchArgs,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    }).catch((error) => {
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
