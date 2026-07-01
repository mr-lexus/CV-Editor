import type { Browser as CoreBrowser } from 'puppeteer-core'
import type { Browser as PuppeteerBrowser, LaunchOptions } from 'puppeteer'
import fs from 'node:fs'

const localLaunchArgs = ['--no-sandbox', '--disable-setuid-sandbox']

type BrowserInstance = CoreBrowser | PuppeteerBrowser

let browserPromise: Promise<BrowserInstance> | null = null

function resolveConfiguredExecutablePath(): string | undefined {
  const configuredPath = process.env.PUPPETEER_EXECUTABLE_PATH?.trim()

  if (configuredPath && fs.existsSync(configuredPath)) {
    return configuredPath
  }
}

function isVercelRuntime(): boolean {
  return process.env.VERCEL === '1' || typeof process.env.VERCEL_ENV === 'string'
}

async function launchBrowser(): Promise<BrowserInstance> {
  if (isVercelRuntime()) {
    const chromium = (await import('@sparticuz/chromium')).default
    const puppeteer = await import('puppeteer-core')

    return puppeteer.launch({
      args: [...chromium.args, ...localLaunchArgs],
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  const puppeteer = await import('puppeteer')
  const executablePath = resolveConfiguredExecutablePath()
  const launchOptions: LaunchOptions = {
    headless: true,
    args: localLaunchArgs,
  }

  if (executablePath) {
    launchOptions.executablePath = executablePath
  }

  return puppeteer.default.launch(launchOptions)
}

export async function getBrowser(): Promise<BrowserInstance> {
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
