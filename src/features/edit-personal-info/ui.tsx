import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createPersonalInfoSchema } from '@/entities/cv/model/schema'
import { selectActiveCV, selectActiveVersion } from '@/entities/cv/model/selectors'
import { useCVStore } from '@/entities/cv/model/store'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { PersonalInfo } from '@/entities/cv/model/types'
import { Upload, X } from 'lucide-react'
import { ImageCropper } from './ImageCropper'
import { RichTextEditor } from '@/shared/ui/RichTextEditor'
import { useI18n } from '@/shared/i18n'

export const EditPersonalInfo = () => {
  const { t } = useI18n()
  const setPersonalInfo = useCVStore((state) => state.setPersonalInfo)
  const initialValues = useCVStore((state) => selectActiveCV(state).personalInfo)
  const activeVersionId = useCVStore((state) => selectActiveVersion(state)?.id)
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const schema = useMemo(
    () =>
      createPersonalInfoSchema({
        nameMin: t('personalInfo.validation.nameMin'),
        jobTitleMin: t('personalInfo.validation.jobTitleMin'),
        invalidEmail: t('personalInfo.validation.invalidEmail'),
      }),
    [t],
  )

  const {
    register,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PersonalInfo>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })

  useEffect(() => {
    const currentVersion = useCVStore.getState().workspace.versions.find((version) => version.id === activeVersionId)

    if (currentVersion) {
      reset(currentVersion.cv.personalInfo)
    }
  }, [activeVersionId, reset])

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
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">{t('personalInfo.title')}</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="mb-2 flex items-center gap-4 space-y-2 md:col-span-2">
          <div className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 bg-gray-50 ${currentPhotoShape === 'square' ? 'rounded-md' : 'rounded-full'}`}>
            {currentPhotoUrl ? (
              <img src={currentPhotoUrl} alt={t('preview.placeholders.profilePhotoAlt')} className="h-full w-full object-cover" />
            ) : (
              <span className="px-2 text-center text-xs text-gray-400">{t('personalInfo.noPhoto')}</span>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="photoUpload" className="inline-flex w-fit cursor-pointer items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium transition-colors hover:bg-gray-50">
              <Upload className="h-4 w-4" />
              {t('personalInfo.uploadPhoto')}
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
                className="inline-flex items-center gap-1 text-left text-sm text-red-500 transition-colors hover:text-red-700"
              >
                <X className="h-3 w-3" />
                {t('personalInfo.removePhoto')}
              </button>
            )}
          </div>
          <div className="ml-4 flex flex-col gap-1 border-l border-gray-200 pl-4">
            <span className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">{t('personalInfo.shape')}</span>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value="round" {...register('photoShape')} className="text-blue-600 focus:ring-blue-500" />
              {t('personalInfo.round')}
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" value="square" {...register('photoShape')} className="text-blue-600 focus:ring-blue-500" />
              {t('personalInfo.square')}
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
          <Label htmlFor="fullName">{t('personalInfo.fullName')}</Label>
          <Input id="fullName" placeholder={t('personalInfo.placeholders.fullName')} {...register('fullName')} />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobTitle">{t('personalInfo.jobTitle')}</Label>
          <Input id="jobTitle" placeholder={t('personalInfo.placeholders.jobTitle')} {...register('jobTitle')} />
          {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('personalInfo.email')}</Label>
          <Input id="email" type="email" placeholder={t('personalInfo.placeholders.email')} {...register('email')} />
          {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('personalInfo.phone')}</Label>
          <Input id="phone" placeholder={t('personalInfo.placeholders.phone')} {...register('phone')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp">{t('personalInfo.whatsapp')}</Label>
          <Input id="whatsapp" placeholder={t('personalInfo.placeholders.phone')} {...register('whatsapp')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="telegram">{t('personalInfo.telegram')}</Label>
          <Input id="telegram" placeholder={t('personalInfo.placeholders.telegram')} {...register('telegram')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">{t('personalInfo.github')}</Label>
          <Input id="github" placeholder={t('personalInfo.placeholders.github')} {...register('github')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">{t('personalInfo.linkedin')}</Label>
          <Input id="linkedin" placeholder={t('personalInfo.placeholders.linkedin')} {...register('linkedin')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">{t('personalInfo.age')}</Label>
          <Input id="age" type="number" placeholder={t('personalInfo.placeholders.age')} {...register('age')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceYearsMode">{t('personalInfo.experienceYears')}</Label>
          <select
            id="experienceYearsMode"
            {...register('experienceYearsMode')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="hidden">{t('personalInfo.doNotShow')}</option>
            <option value="auto">{t('personalInfo.calculateFromExperience')}</option>
            <option value="manual">{t('personalInfo.enterManually')}</option>
          </select>
        </div>

        {experienceYearsMode === 'manual' && (
          <div className="space-y-2">
            <Label htmlFor="manualExperienceYears">{t('personalInfo.manualExperienceYears')}</Label>
            <Input
              id="manualExperienceYears"
              type="number"
              step="0.5"
              min="0"
              placeholder={t('personalInfo.placeholders.manualExperienceYears')}
              {...register('manualExperienceYears')}
            />
          </div>
        )}

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location">{t('personalInfo.location')}</Label>
          <Input id="location" placeholder={t('personalInfo.placeholders.location')} {...register('location')} />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="summary">{t('personalInfo.summary')}</Label>
          <RichTextEditor
            id="summary"
            value={summaryValue || ''}
            onChange={(val) => setValue('summary', val, { shouldDirty: true })}
            placeholder={t('personalInfo.placeholders.summary')}
            minHeight={100}
          />
        </div>
      </div>
    </div>
  )
}
