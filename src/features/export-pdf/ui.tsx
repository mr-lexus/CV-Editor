import { FileDown } from 'lucide-react'
import { useState } from 'react'
import { selectActiveVersion } from '@/entities/cv/model/selectors'
import { buildCVPreviewUrl, PDF_API_ENDPOINT } from '@/shared/lib/cv-render-data'
import { useCVStore } from '@/entities/cv/model/store'
import type { CVVersion } from '@/entities/cv/model/types'
import { useI18n } from '@/shared/i18n'
import { Button } from '@/shared/ui/Button'

function toFileName(fullName: string): string {
  const baseName = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${baseName || 'cv'}.pdf`
}

function readFileName(headers: Headers, fallbackFileName: string): string {
  const contentDisposition = headers.get('content-disposition')

  if (!contentDisposition) {
    return fallbackFileName
  }

  const match = contentDisposition.match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i)
  return match?.[1] ? decodeURIComponent(match[1].replace(/"/g, '')) : fallbackFileName
}

async function readErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    const body = (await response.json()) as { message?: string }
    return body.message || 'PDF generation failed.'
  }

  const text = await response.text()
  return text || 'PDF generation failed.'
}

async function requestPdf(version: CVVersion, origin: string): Promise<{ blob: Blob; fileName: string }> {
  const fallbackFileName = toFileName(`${version.cv.personalInfo.fullName}-${version.locale}`)
  const previewUrl = buildCVPreviewUrl(origin)
  const response = await fetch(PDF_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        cv: version.cv,
        locale: version.locale,
      },
      fileName: fallbackFileName,
      url: previewUrl,
    }),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return {
    blob: await response.blob(),
    fileName: readFileName(response.headers, fallbackFileName),
  }
}

export const ExportPDF = () => {
  const { t } = useI18n()
  const activeVersion = useCVStore(selectActiveVersion)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    if (!activeVersion) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const singleResult = await requestPdf(activeVersion, window.location.origin)
      const objectUrl = URL.createObjectURL(singleResult.blob)
      const downloadLink = document.createElement('a')

      downloadLink.href = objectUrl
      downloadLink.download = singleResult.fileName
      downloadLink.click()

      URL.revokeObjectURL(objectUrl)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('export.error'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleExport} disabled={isLoading} className="w-full sm:w-auto">
        <FileDown className="mr-2 h-4 w-4" />
        {isLoading ? t('export.singleLoading') : t('export.single')}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
