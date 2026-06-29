import type { ChangeEvent } from 'react'
import { useCVStore } from '@/entities/cv/model/store'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Plus, Trash2, Upload, X } from 'lucide-react'

export const EditOpenSourceProjects = () => {
  const openSourceProjects = useCVStore((state) => state.cv.openSourceProjects || [])
  const addOpenSourceProject = useCVStore((state) => state.addOpenSourceProject)
  const updateOpenSourceProject = useCVStore((state) => state.updateOpenSourceProject)
  const removeOpenSourceProject = useCVStore((state) => state.removeOpenSourceProject)

  const handleAdd = () => {
    addOpenSourceProject({
      id: crypto.randomUUID(),
      link: '',
      logoUrl: '',
      description: '',
    })
  }

  const handleLogoUpload = (projectId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateOpenSourceProject(projectId, { logoUrl: reader.result as string })
      }
      reader.readAsDataURL(file)
    }

    event.target.value = ''
  }

  const handleRemoveLogo = (projectId: string) => {
    updateOpenSourceProject(projectId, { logoUrl: '' })
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Open Source Projects</h2>
        <Button onClick={handleAdd} variant="outline" size="sm" className="h-8">
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      <div className="space-y-6">
        {openSourceProjects.map((project) => (
          <div key={project.id} className="relative grid grid-cols-1 gap-4 border-t border-gray-100 pt-4 first:border-0 first:pt-0 md:grid-cols-2">
            <Button
              variant="ghost"
              className="absolute -right-2 -top-2 h-auto p-2 text-red-500 hover:text-red-700"
              onClick={() => removeOpenSourceProject(project.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="space-y-2 md:col-span-2">
              <Label>Project Logo</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50 p-2">
                  {project.logoUrl ? (
                    <img
                      src={project.logoUrl}
                      alt="Project logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-gray-400">No Logo</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor={`open-source-logo-${project.id}`}
                    className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Label>
                  <input
                    id={`open-source-logo-${project.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleLogoUpload(project.id, event)}
                  />
                  {project.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLogo(project.id)}
                      className="inline-flex items-center gap-1 text-left text-sm text-red-500 transition-colors hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Project Link</Label>
              <Input
                value={project.link}
                onChange={(event) => updateOpenSourceProject(project.id, { link: event.target.value })}
                placeholder="https://github.com/username/project"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Short Description</Label>
              <textarea
                value={project.description}
                onChange={(event) => updateOpenSourceProject(project.id, { description: event.target.value })}
                placeholder="A brief summary of the project, stack, or your contribution..."
                rows={3}
                className="flex min-h-[84px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        ))}
        {openSourceProjects.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-500">No open source projects added yet.</p>
        )}
      </div>
    </div>
  )
}
