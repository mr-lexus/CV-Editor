import { EditPersonalInfo } from '@/features/edit-personal-info/ui'
import { EditExperience } from '@/features/edit-experience/ui'
import { EditOpenSourceProjects } from '@/features/edit-open-source-projects/ui'
import { EditEducation } from '@/features/edit-education/ui'
import { AddLanguage } from '@/features/add-language/ui'
import { AddSkill } from '@/features/add-skill/ui'
import { selectActiveVersion } from '@/entities/cv/model/selectors'
import { useCVStore } from '@/entities/cv/model/store'
import { useI18n } from '@/shared/i18n'

export const CVEditor = () => {
  const { t } = useI18n()
  const activeVersion = useCVStore(selectActiveVersion)

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-r border-gray-200 bg-gray-50 p-2">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('editor.title')}</h1>
          <p className="text-sm text-gray-500">{activeVersion?.locale.toUpperCase()}</p>
        </div>
      </div>

      <EditPersonalInfo />
      <EditExperience />
      <EditOpenSourceProjects />
      <EditEducation />
      <AddLanguage />
      <AddSkill />
    </div>
  )
}
