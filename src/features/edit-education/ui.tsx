import type { ChangeEvent } from 'react'
import { selectActiveCV } from '@/entities/cv/model/selectors'
import { useCVStore } from '@/entities/cv/model/store'
import { useI18n } from '@/shared/i18n'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { MonthYearInput } from '@/shared/ui/MonthYearInput'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import { RichTextEditor } from '@/shared/ui/RichTextEditor'

export const EditEducation = () => {
  const { t } = useI18n()
  const education = useCVStore((state) => selectActiveCV(state).education || [])
  const addEducation = useCVStore((state) => state.addEducation)
  const updateEducation = useCVStore((state) => state.updateEducation)
  const removeEducation = useCVStore((state) => state.removeEducation)

  const handleAdd = () => {
    addEducation({
      id: crypto.randomUUID(),
      institution: '',
      logoUrl: '',
      degree: '',
      startDate: '',
      endDate: '',
      description: '',
    })
  }

  const handleLogoUpload = (educationId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateEducation(educationId, { logoUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleRemoveLogo = (educationId: string) => {
    updateEducation(educationId, { logoUrl: '' })
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{t('education.title')}</h2>
        <Button onClick={handleAdd} variant="outline" size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" /> {t('common.add')}
        </Button>
      </div>

      <div className="space-y-6">
        {education.map((edu) => (
          <div key={edu.id} className="relative grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 first:border-0 first:pt-0 md:grid-cols-2">
            <Button
              variant="ghost"
              className="absolute -right-2 -top-2 h-auto p-2 text-red-500 hover:text-red-700"
              onClick={() => removeEducation(edu.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2 md:col-span-2">
              <Label>{t('education.institutionLogo')}</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                  {edu.logoUrl ? (
                    <img
                      src={edu.logoUrl}
                      alt={`${edu.institution || 'Institution'} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-gray-400">{t('personalInfo.noPhoto')}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor={`education-logo-${edu.id}`}
                    className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    {t('education.uploadLogo')}
                  </Label>
                  <input
                    id={`education-logo-${edu.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(edu.id, e)}
                  />
                  {edu.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo(edu.id)}
                      className="inline-flex items-center gap-1 text-left text-sm text-red-500 transition-colors hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                      {t('education.removeLogo')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('education.institution')}</Label>
              <Input
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                placeholder={t('education.placeholders.institution')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('education.degree')}</Label>
              <Input
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                placeholder={t('education.placeholders.degree')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('education.startDate')}</Label>
              <MonthYearInput
                value={edu.startDate}
                onChange={(value) => updateEducation(edu.id, { startDate: value })}
                monthOptional
              />
            </div>

            <div className="space-y-2">
              <Label>{t('education.endDate')}</Label>
              <MonthYearInput
                value={edu.endDate}
                onChange={(value) => updateEducation(edu.id, { endDate: value })}
                monthOptional
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>{t('education.description')}</Label>
              <RichTextEditor
                value={edu.description}
                onChange={(val) => updateEducation(edu.id, { description: val })}
                placeholder={t('education.placeholders.description')}
                minHeight={100}
              />
            </div>
          </div>
        ))}
        {education.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">{t('education.empty')}</p>
        )}
      </div>
    </div>
  )
}



