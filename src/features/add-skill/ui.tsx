import { useState } from 'react'
import { useCVStore } from '@/entities/cv/model/store'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Plus, X } from 'lucide-react'

export const AddSkill = () => {
  const { cv, addSkill, removeSkill } = useCVStore()
  const [skillName, setSkillName] = useState('')

  const handleAdd = () => {
    if (skillName.trim()) {
      addSkill({ id: crypto.randomUUID(), name: skillName.trim() })
      setSkillName('')
    }
  }

  return (
    <div className="space-y-4 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">Skills</h2>

      <div className="flex gap-2">
        <Input
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. React, TypeScript, Node.js"
        />
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {cv.skills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200"
          >
            {skill.name}
            <button
              onClick={() => removeSkill(skill.id)}
              className="ml-2 text-blue-400 hover:text-blue-600 focus:outline-none"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
