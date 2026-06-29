from pathlib import Path

repo = Path('/home/lexus/server/pets/cvGen')


def replace_once(relative_path: str, old: str, new: str) -> None:
    path = repo / relative_path
    text = path.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'Replacement target not found in {relative_path}: {old[:80]!r}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')


replace_once(
    'src/entities/cv/model/types.ts',
    "export interface PersonalInfo {\n",
    "export type ExperienceYearsMode = 'hidden' | 'auto' | 'manual'\n\nexport interface PersonalInfo {\n",
)
replace_once(
    'src/entities/cv/model/types.ts',
    "  photoUrl?: string\n  photoShape?: 'square' | 'round'\n}\n",
    "  photoUrl?: string\n  photoShape?: 'square' | 'round'\n  experienceYearsMode?: ExperienceYearsMode\n  manualExperienceYears?: string\n}\n",
)

replace_once(
    'src/entities/cv/model/defaults.ts',
    "    photoUrl: '',\n    photoShape: 'round',\n",
    "    photoUrl: '',\n    photoShape: 'round',\n    experienceYearsMode: 'auto',\n    manualExperienceYears: '',\n",
)

replace_once(
    'src/entities/cv/model/store.ts',
    "    photoUrl: '',\n    photoShape: 'round',\n",
    "    photoUrl: '',\n    photoShape: 'round',\n    experienceYearsMode: 'auto',\n    manualExperienceYears: '',\n",
)

replace_once(
    'src/entities/cv/model/schema.ts',
    "  photoUrl: z.string().optional(),\n  photoShape: z.enum(['square', 'round']).optional(),\n})\n",
    "  photoUrl: z.string().optional(),\n  photoShape: z.enum(['square', 'round']).optional(),\n  experienceYearsMode: z.enum(['hidden', 'auto', 'manual']).optional(),\n  manualExperienceYears: z.string().optional(),\n})\n",
)

for relative_path in ['src/shared/lib/cv-render-data.ts', 'src/shared/lib/cv-preview.ts']:
    replace_once(
        relative_path,
        "      photoUrl: readString(personalInfo.photoUrl),\n      photoShape: personalInfo.photoShape === 'square' ? 'square' : 'round',\n    },\n",
        "      photoUrl: readString(personalInfo.photoUrl),\n      photoShape: personalInfo.photoShape === 'square' ? 'square' : 'round',\n      experienceYearsMode:\n        personalInfo.experienceYearsMode === 'hidden' || personalInfo.experienceYearsMode === 'manual'\n          ? personalInfo.experienceYearsMode\n          : 'auto',\n      manualExperienceYears: readString(personalInfo.manualExperienceYears),\n    },\n",
    )

replace_once(
    'src/features/edit-personal-info/ui.tsx',
    "  const currentPhotoUrl = watch('photoUrl')\n  const currentPhotoShape = watch('photoShape')\n  const summaryValue = watch('summary')\n",
    "  const currentPhotoUrl = watch('photoUrl')\n  const currentPhotoShape = watch('photoShape')\n  const summaryValue = watch('summary')\n  const experienceYearsMode = watch('experienceYearsMode') || 'auto'\n",
)
replace_once(
    'src/features/edit-personal-info/ui.tsx',
    "        <div className=\"space-y-2\">\n          <Label htmlFor=\"age\">Age</Label>\n          <Input id=\"age\" type=\"number\" placeholder=\"25\" {...register('age')} />\n        </div>\n\n        <div className=\"space-y-2 md:col-span-2\">\n          <Label htmlFor=\"location\">Location</Label>\n          <Input id=\"location\" placeholder=\"New York, USA\" {...register('location')} />\n        </div>\n",
    "        <div className=\"space-y-2\">\n          <Label htmlFor=\"age\">Age</Label>\n          <Input id=\"age\" type=\"number\" placeholder=\"25\" {...register('age')} />\n        </div>\n\n        <div className=\"space-y-2\">\n          <Label htmlFor=\"experienceYearsMode\">Experience Years</Label>\n          <select\n            id=\"experienceYearsMode\"\n            {...register('experienceYearsMode')}\n            className=\"flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20\"\n          >\n            <option value=\"hidden\">Do not show</option>\n            <option value=\"auto\">Calculate from experience</option>\n            <option value=\"manual\">Enter manually</option>\n          </select>\n        </div>\n\n        {experienceYearsMode === 'manual' && (\n          <div className=\"space-y-2\">\n            <Label htmlFor=\"manualExperienceYears\">Manual Experience Years</Label>\n            <Input\n              id=\"manualExperienceYears\"\n              type=\"number\"\n              step=\"0.5\"\n              min=\"0\"\n              placeholder=\"5\"\n              {...register('manualExperienceYears')}\n            />\n          </div>\n        )}\n\n        <div className=\"space-y-2 md:col-span-2\">\n          <Label htmlFor=\"location\">Location</Label>\n          <Input id=\"location\" placeholder=\"New York, USA\" {...register('location')} />\n        </div>\n",
)

replace_once(
    'src/shared/ui/CVHtmlDocument.tsx',
    "function formatDateRange(startDate?: string, endDate?: string): string {\n  const formattedStart = formatMonthYear(startDate) || 'Start'\n  const formattedEnd = formatMonthYear(endDate) || 'Present'\n\n  return `${formattedStart} - ${formattedEnd}`\n}\n\nfunction normalizeProjectLink(link: string): string {\n",
    "function formatDateRange(startDate?: string, endDate?: string): string {\n  const formattedStart = formatMonthYear(startDate) || 'Start'\n  const formattedEnd = formatMonthYear(endDate) || 'Present'\n\n  return `${formattedStart} - ${formattedEnd}`\n}\n\nfunction parseMonthIndex(value: string | undefined, boundary: 'start' | 'end'): number | null {\n  if (!value) {\n    return null\n  }\n\n  const yearOnlyMatch = value.match(/^(\\d{4})$/)\n\n  if (yearOnlyMatch) {\n    const year = Number(yearOnlyMatch[1])\n    const month = boundary === 'start' ? 0 : 11\n\n    return year * 12 + month\n  }\n\n  const match = value.match(/^(\\d{4})-(\\d{2})$/)\n\n  if (!match) {\n    return null\n  }\n\n  const year = Number(match[1])\n  const month = Number(match[2]) - 1\n\n  if (month < 0 || month >= 12) {\n    return null\n  }\n\n  return year * 12 + month\n}\n\nfunction calculateExperienceMonths(experience: CV['experience']): number {\n  const currentDate = new Date()\n  const currentMonthIndex = currentDate.getFullYear() * 12 + currentDate.getMonth()\n  const ranges = experience\n    .map((entry) => {\n      const start = parseMonthIndex(entry.startDate, 'start')\n      const end = parseMonthIndex(entry.endDate, 'end') ?? currentMonthIndex\n\n      if (start === null || end < start) {\n        return null\n      }\n\n      return { start, end }\n    })\n    .filter((range): range is { start: number; end: number } => range !== null)\n    .sort((left, right) => left.start - right.start)\n\n  if (ranges.length === 0) {\n    return 0\n  }\n\n  const mergedRanges = [{ ...ranges[0] }]\n\n  for (const range of ranges.slice(1)) {\n    const lastRange = mergedRanges[mergedRanges.length - 1]\n\n    if (range.start <= lastRange.end + 1) {\n      lastRange.end = Math.max(lastRange.end, range.end)\n      continue\n    }\n\n    mergedRanges.push({ ...range })\n  }\n\n  return mergedRanges.reduce((total, range) => total + (range.end - range.start + 1), 0)\n}\n\nfunction formatExperienceYearsLabel(value: string): string | null {\n  const trimmedValue = value.trim()\n\n  if (!trimmedValue) {\n    return null\n  }\n\n  const numericValue = Number(trimmedValue)\n\n  if (!Number.isNaN(numericValue)) {\n    const normalizedValue = Number.isInteger(numericValue)\n      ? String(numericValue)\n      : numericValue.toFixed(1).replace(/\\.0$/, '')\n\n    return `${normalizedValue} ${numericValue === 1 ? 'year' : 'years'} of experience`\n  }\n\n  return `${trimmedValue} years of experience`\n}\n\nfunction getExperienceYearsLabel(personalInfo: CV['personalInfo'], experience: CV['experience']): string | null {\n  if (personalInfo.experienceYearsMode === 'hidden') {\n    return null\n  }\n\n  if (personalInfo.experienceYearsMode === 'manual') {\n    return formatExperienceYearsLabel(personalInfo.manualExperienceYears || '')\n  }\n\n  const totalMonths = calculateExperienceMonths(experience)\n\n  if (totalMonths <= 0) {\n    return null\n  }\n\n  if (totalMonths < 12) {\n    return 'Less than 1 year of experience'\n  }\n\n  const wholeYears = Math.floor(totalMonths / 12)\n  const value = `${wholeYears}${totalMonths % 12 === 0 ? '' : '+'}`\n\n  return `${value} ${wholeYears === 1 ? 'year' : 'years'} of experience`\n}\n\nfunction normalizeProjectLink(link: string): string {\n",
)
replace_once(
    'src/shared/ui/CVHtmlDocument.tsx',
    "function CVHtmlDocument({ cv, mode = 'preview' }: { cv: CV; mode?: RenderMode }) {\n  const { personalInfo, experience = [], openSourceProjects = [], education = [], languages = [], skills = [] } = cv\n\n  const firstExperience = experience[0]\n",
    "function CVHtmlDocument({ cv, mode = 'preview' }: { cv: CV; mode?: RenderMode }) {\n  const { personalInfo, experience = [], openSourceProjects = [], education = [], languages = [], skills = [] } = cv\n  const experienceYearsLabel = getExperienceYearsLabel(personalInfo, experience)\n\n  const firstExperience = experience[0]\n",
)
replace_once(
    'src/shared/ui/CVHtmlDocument.tsx',
    "          <p className=\"mb-3 text-xl font-medium text-blue-600\">{personalInfo.jobTitle || 'Job Title'}</p>\n          <div className=\"cv-contact-list text-sm text-gray-600\">\n",
    "          <p className={cn('text-xl font-medium text-blue-600', experienceYearsLabel ? 'mb-1.5' : 'mb-3')}>\n            {personalInfo.jobTitle || 'Job Title'}\n          </p>\n          {experienceYearsLabel && (\n            <p className=\"mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500\">\n              {experienceYearsLabel}\n            </p>\n          )}\n          <div className=\"cv-contact-list text-sm text-gray-600\">\n",
)

print('Updated experience years feature files successfully.')
