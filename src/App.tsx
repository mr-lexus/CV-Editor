import { CVBuilderPage } from '@/pages/cv-builder'
import { CVPrintPreviewPage } from '@/pages/cv-print-preview/ui'
import { selectActiveLocale } from '@/entities/cv/model/selectors'
import { useCVStore } from '@/entities/cv/model/store'
import { getRenderModeFromSearch, isPrintPreviewPath } from '@/shared/lib/cv-render-data'
import { I18nProvider } from '@/shared/i18n'
import { readCVDataFromSearch } from '@/shared/lib/cv-render-data'

function shouldRenderPrintPreview(pathname: string, search: string): boolean {
  return getRenderModeFromSearch(search) === 'print' || isPrintPreviewPath(pathname)
}

export function App() {
  const isPrintPreview = shouldRenderPrintPreview(window.location.pathname, window.location.search)
  const renderPayload = isPrintPreview ? readCVDataFromSearch(window.location.search) : null
  const activeLocale = useCVStore(selectActiveLocale)
  const locale = renderPayload?.locale ?? activeLocale

  return (
    <I18nProvider locale={locale}>
      {isPrintPreview ? <CVPrintPreviewPage renderPayload={renderPayload} /> : <CVBuilderPage />}
    </I18nProvider>
  )
}

export default App
