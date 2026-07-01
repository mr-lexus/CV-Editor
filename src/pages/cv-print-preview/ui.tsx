import { useEffect } from 'react'
import type { CVRenderPayload } from '@/shared/lib/cv-render-data'
import { getRenderModeFromSearch } from '@/shared/lib/cv-render-data'
import { CVPreview } from '@/widgets/cv-preview/ui'

export const CVPrintPreviewPage = ({ renderPayload }: { renderPayload: CVRenderPayload | null }) => {
  const search = window.location.search
  const mode = getRenderModeFromSearch(search)

  useEffect(() => {
    document.documentElement.classList.add('cv-print-page')
    document.body.classList.add('cv-print-page')

    return () => {
      document.documentElement.classList.remove('cv-print-page')
      document.body.classList.remove('cv-print-page')
    }
  }, [])

  return (
    <main className="min-h-screen bg-white">
      <CVPreview cv={renderPayload?.cv} mode={mode} />
    </main>
  )
}
