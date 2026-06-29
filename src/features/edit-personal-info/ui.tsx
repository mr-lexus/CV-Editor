import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { personalInfoSchema } from '@/entities/cv/model/schema'
import { useCVStore } from '@/entities/cv/model/store'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { PersonalInfo } from '@/entities/cv/model/types'
import { Upload, X } from 'lucide-react'
import { ImageCropper } from './ImageCropper'
import { RichTextEditor } from '@/shared/ui/RichTextEditor'

export const EditPersonalInfo = () => {
  const setPersonalInfo = useCVStore((state) => state.setPersonalInfo)
  const initialValues = useCVStore((state) => state.cv.personalInfo)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: initialValues,
  })

  // Subscribe to form changes and sync to store without causing re-renders
  useEffect(() => {
    const subscription = watch((value) => {
      setPersonalInfo(value as PersonalInfo)
    })
    return () => subscription.unsubscribe()
  }, [watch, setPersonalInfo])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCropImageUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleCropSave = (croppedBase64: string) => {
    setValue('photoUrl', croppedBase64, { shouldDirty: true, shouldValidate: true })
    setCropImageUrl(null)
  }

  const handleCropCancel = () => {
    setCropImageUrl(null)
  }

  const handleRemovePhoto = () => {
    setValue('photoUrl', '', { shouldDirty: true, shouldValidate: true })
  }

  const currentPhotoUrl = watch('photoUrl')
  const currentPhotoShape = watch('photoShape')
  const summaryValue = watch('summary')
  const experienceYearsMode = watch('experienceYearsMode') || 'auto'

  return (
    <div className="space-y-4 p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2 flex items-center gap-4 mb-2">
          <div className={`w-20 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0 ${currentPhotoShape === 'square' ? 'rounded-md' : 'rounded-full'}`}>
            {currentPhotoUrl ? (
              <img src={currentPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-xs text-center px-2">No Photo</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="photoUpload" className="cursor-pointer bg-white border border-gray-300 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 inline-flex items-center justify-center gap-2 w-fit transition-colors">
              <Upload className="w-4 h-4" />
              Upload Photo
            </Label>
            <input
              id="photoUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            {currentPhotoUrl && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="text-sm text-red-500 hover:text-red-700 text-left inline-flex items-center gap-1 transition-colors"
              >
                <X className="w-3 h-3" />
                Remove Photo
              </button>
            )}
          </div>
          <div className="flex flex-col gap-1 ml-4 border-l pl-4 border-gray-200">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Shape</span>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value="round" {...register('photoShape')} className="text-blue-600 focus:ring-blue-500" />
              Round
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value="square" {...register('photoShape')} className="text-blue-600 focus:ring-blue-500" />
              Square
            </label>
          </div>
        </div>

        {cropImageUrl && (
          <ImageCropper
            imageUrl={cropImageUrl}
            shape={currentPhotoShape === 'square' ? 'square' : 'round'}
            onCrop={handleCropSave}
            onCancel={handleCropCancel}
          />
        )}

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="John Doe" {...register('fullName')} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">Job Title</Label>
          <Input id="jobTitle" placeholder="Frontend Developer" {...register('jobTitle')} />
          {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" placeholder="+1 234 567 890" {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" placeholder="+1 234 567 890" {...register('whatsapp')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegram">Telegram</Label>
          <Input id="telegram" placeholder="@username" {...register('telegram')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input id="github" placeholder="github.com/username" {...register('github')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input id="linkedin" placeholder="linkedin.com/in/username" {...register('linkedin')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Age</Label>
          <Input id="age" type="number" placeholder="25" {...register('age')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceYearsMode">Experience Years</Label>
          <select
            id="experienceYearsMode"
            {...register('experienceYearsMode')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="hidden">Do not show</option>
            <option value="auto">Calculate from experience</option>
            <option value="manual">Enter manually</option>
          </select>
        </div>

        {experienceYearsMode === 'manual' && (
          <div className="space-y-2">
            <Label htmlFor="manualExperienceYears">Manual Experience Years</Label>
            <Input
              id="manualExperienceYears"
              type="number"
              step="0.5"
              min="0"
              placeholder="5"
              {...register('manualExperienceYears')}
            />
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" placeholder="New York, USA" {...register('location')} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">Summary</Label>
          <RichTextEditor
            id="summary"
            value={summaryValue || ''}
            onChange={(val) => setValue('summary', val, { shouldDirty: true })}
            placeholder="A brief summary about yourself..."
            minHeight={100}
          />
        </div>
      </div>
    </div>
  )
}
