import { CVBuilderPage } from '@/pages/cv-builder'
import { CVPrintPreviewPage } from '@/pages/cv-print-preview/ui'
import { getRenderModeFromSearch, isPrintPreviewPath } from '@/shared/lib/cv-render-data'

function shouldRenderPrintPreview(pathname: string, search: string): boolean {
  return getRenderModeFromSearch(search) === 'print' || isPrintPreviewPath(pathname)
}

export function App() {
  return shouldRenderPrintPreview(window.location.pathname, window.location.search)
    ? <CVPrintPreviewPage />
    : <CVBuilderPage />
}

export default App
