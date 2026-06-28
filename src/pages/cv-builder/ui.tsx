import { ExportPDF } from '@/features/export-pdf/ui'
import { CVEditor } from '@/widgets/cv-editor/ui'
import { CVPreview } from '@/widgets/cv-preview/ui'

export const CVBuilderPage = () => {
  return (
    <div className="cv-builder-page flex h-screen w-full overflow-hidden bg-white">
      <div className="cv-editor-pane z-10 flex w-full flex-shrink-0 flex-col border-r border-gray-200 md:w-1/2 lg:w-[450px] xl:w-[500px]">
        <div className="border-b border-gray-200 bg-white p-2 md:hidden">
          <ExportPDF />
        </div>
        <div className="flex-1 overflow-hidden">
          <CVEditor />
        </div>
      </div>

      <div className="cv-preview-pane relative hidden min-w-0 flex-1 flex-col overflow-hidden bg-gray-100 md:flex">
        <div className="cv-preview-toolbar absolute right-8 top-4 z-20">
          <ExportPDF />
        </div>
        <div className="cv-preview-scroll min-w-0 flex-1 overflow-y-auto">
          <CVPreview />
        </div>
      </div>
    </div>
  )
}
