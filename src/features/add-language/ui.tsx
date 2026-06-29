import { useState } from 'react'
import { useCVStore } from '@/entities/cv/model/store'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Languages, Plus, X } from 'lucide-react'

const LANGUAGE_LEVEL_OPTIONS = [
  'A1 - Elementary',
  'A2 - Pre-Intermediate',
  'B1 - Intermediate',
  'B2 - Upper-Intermediate',
  'C1 - Advanced',
  'C2 - Proficient',
  'Native',
] as const

export const AddLanguage = () => {
  const languages = useCVStore((state) => state.cv.languages || [])
  const addLanguage = useCVStore((state) => state.addLanguage)
  const removeLanguage = useCVStore((state) => state.removeLanguage)
  const [languageName, setLanguageName] = useState('')
  const [languageLevel, setLanguageLevel] = useState('')

  const handleAdd = () => {
    const name = languageName.trim()
    const level = languageLevel.trim()

    if (name && level) {
      addLanguage({ id: crypto.randomUUID(), name, level })
      setLanguageName('')
      setLanguageLevel('')
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="flex items-center gap-2">
        <Languages className="h-5 w-5 text-gray-500" />
        <h2 className="text-xl font-semibold text-gray-800">Languages</h2>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_240px_auto]">
        <Input
          value={languageName}
          onChange={(e) => setLanguageName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. English"
        />
        <select
          value={languageLevel}
          onChange={(e) => setLanguageLevel(e.target.value)}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="">Select level</option>
          {LANGUAGE_LEVEL_OPTIONS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {languages.map((language) => (
          <span
            key={language.id}
            className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700"
          >
            {language.name} - {language.level}
            <button
              onClick={() => removeLanguage(language.id)}
              className="ml-2 text-emerald-400 hover:text-emerald-600 focus:outline-none"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}
