import { EditPersonalInfo } from '@/features/edit-personal-info/ui'
import { EditExperience } from '@/features/edit-experience/ui'
import { EditOpenSourceProjects } from '@/features/edit-open-source-projects/ui'
import { EditEducation } from '@/features/edit-education/ui'
import { AddLanguage } from '@/features/add-language/ui'
import { AddSkill } from '@/features/add-skill/ui'
import { useCVStore } from '@/entities/cv/model/store'
import { Button } from '@/shared/ui/Button'
import { Trash2 } from 'lucide-react'

export const CVEditor = () => {
  const { resetCV } = useCVStore()

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto border-r border-gray-200 bg-gray-50 p-2">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">CV Editor</h1>
        <Button variant="destructive" size="sm" onClick={resetCV} className="h-8">
          <Trash2 className="mr-2 h-4 w-4" /> Reset
        </Button>
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
