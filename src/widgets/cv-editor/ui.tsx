import { EditPersonalInfo } from '@/features/edit-personal-info/ui'
import { EditExperience } from '@/features/edit-experience/ui'
import { EditEducation } from '@/features/edit-education/ui'
import { AddSkill } from '@/features/add-skill/ui'
import { useCVStore } from '@/entities/cv/model/store'
import { Button } from '@/shared/ui/Button'
import { Trash2 } from 'lucide-react'

export const CVEditor = () => {
  const { resetCV } = useCVStore()

  return (
    <div className="flex flex-col gap-6 h-full p-2 overflow-y-auto bg-gray-50 border-r border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">CV Editor</h1>
        <Button variant="destructive" size="sm" onClick={resetCV} className="h-8">
          <Trash2 className="w-4 h-4 mr-2" /> Reset
        </Button>
      </div>

      <EditPersonalInfo />
      <EditExperience />
      <EditEducation />
      <AddSkill />
    </div>
  )
}
