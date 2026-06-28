import { CVBuilderPage } from '@/pages/cv-builder'
import { CVPrintPreviewPage } from '@/pages/cv-print-preview/ui'

function isPrintPreviewRoute(pathname: string): boolean {
  return pathname === '/cv/preview'
}

export function App() {
  return (
    isPrintPreviewRoute(window.location.pathname)
      ? <CVPrintPreviewPage />
      : <CVBuilderPage />
  )
}

export default App
