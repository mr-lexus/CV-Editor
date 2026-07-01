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

export const EditExperience = () => {
  const { t } = useI18n()
  const experience = useCVStore((state) => selectActiveCV(state).experience)
  const addExperience = useCVStore((state) => state.addExperience)
  const updateExperience = useCVStore((state) => state.updateExperience)
  const removeExperience = useCVStore((state) => state.removeExperience)

  const handleAdd = () => {
    addExperience({
      id: crypto.randomUUID(),
      company: '',
      logoUrl: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    })
  }

  const handleLogoUpload = (experienceId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateExperience(experienceId, { logoUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleRemoveLogo = (experienceId: string) => {
    updateExperience(experienceId, { logoUrl: '' })
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">{t('experience.title')}</h2>
        <Button onClick={handleAdd} variant="outline" size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" /> {t('common.add')}
        </Button>
      </div>

      <div className="space-y-6">
        {experience.map((exp) => (
          <div key={exp.id} className="relative grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 first:border-0 first:pt-0 md:grid-cols-2">
            <Button
              variant="ghost"
              className="absolute -right-2 -top-2 h-auto p-2 text-red-500 hover:text-red-700"
              onClick={() => removeExperience(exp.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2 md:col-span-2">
              <Label>{t('experience.companyLogo')}</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                  {exp.logoUrl ? (
                    <img
                      src={exp.logoUrl}
                      alt={`${exp.company || 'Company'} logo`}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-gray-400">{t('personalInfo.noPhoto')}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor={`experience-logo-${exp.id}`}
                    className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    {t('experience.uploadLogo')}
                  </Label>
                  <input
                    id={`experience-logo-${exp.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleLogoUpload(exp.id, e)}
                  />
                  {exp.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo(exp.id)}
                      className="inline-flex items-center gap-1 text-left text-sm text-red-500 transition-colors hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                      {t('experience.removeLogo')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('experience.company')}</Label>
              <Input
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                placeholder={t('experience.placeholders.company')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('experience.position')}</Label>
              <Input
                value={exp.position}
                onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                placeholder={t('experience.placeholders.position')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('experience.startDate')}</Label>
              <MonthYearInput
                value={exp.startDate}
                onChange={(value) => updateExperience(exp.id, { startDate: value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('experience.endDate')}</Label>
              <MonthYearInput
                value={exp.endDate}
                onChange={(value) => updateExperience(exp.id, { endDate: value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>{t('experience.description')}</Label>
              <RichTextEditor
                value={exp.description}
                onChange={(val) => updateExperience(exp.id, { description: val })}
                placeholder={t('experience.placeholders.description')}
                minHeight={100}
              />
            </div>
          </div>
        ))}
        {experience.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">{t('experience.empty')}</p>
        )}
      </div>
    </div>
  )
}
