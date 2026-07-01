import type { CV } from '@/entities/cv/model/types'
import { selectActiveCV } from '@/entities/cv/model/selectors'
import { useCVStore } from '@/entities/cv/model/store'
import { cn } from '@/shared/lib/cn'
import { CVHtmlDocument, type RenderMode } from '@/shared/ui/CVHtmlDocument'

interface CVPreviewProps {
  cv?: CV
  mode?: RenderMode
  className?: string
}

export const CVPreview = ({ cv, mode = 'preview', className }: CVPreviewProps) => {
  const storedCV = useCVStore(selectActiveCV)
  const currentCV = cv ?? storedCV

  return (
    <div
      className={cn(
        'cv-preview-shell flex min-w-0 w-full justify-center',
        mode === 'print' ? 'bg-white' : 'min-h-screen overflow-y-auto bg-gray-100 p-8',
        className,
      )}
    >
      <CVHtmlDocument cv={currentCV} mode={mode} />
    </div>
  )
}
