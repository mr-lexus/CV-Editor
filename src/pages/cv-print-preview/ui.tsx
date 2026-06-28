import { useEffect } from 'react'
import { getRenderModeFromSearch, readCVDataFromSearch } from '@/shared/lib/cv-render-data'
import { CVPreview } from '@/widgets/cv-preview/ui'

export const CVPrintPreviewPage = () => {
  const search = window.location.search
  const cv = readCVDataFromSearch(search)
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
      <CVPreview cv={cv} mode={mode} />
    </main>
  )
}
