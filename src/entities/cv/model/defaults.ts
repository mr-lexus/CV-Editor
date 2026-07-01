import type { CV, CVVersion, CVWorkspace, Skill, SkillGroup } from './types'
import type { LocaleCode } from '@/shared/i18n'

export const DEFAULT_SKILL_GROUP_ID = 'default-skill-group'

export function createDefaultSkillGroup(skills: Skill[] = []): SkillGroup {
  return {
    id: DEFAULT_SKILL_GROUP_ID,
    name: '',
    skills,
    isDefault: true,
  }
}

export const emptyCV: CV = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    whatsapp: '',
    telegram: '',
    github: '',
    linkedin: '',
    age: '',
    location: '',
    summary: '',
    photoUrl: '',
    photoShape: 'round',
    experienceYearsMode: 'auto',
    manualExperienceYears: '',
  },
  experience: [],
  openSourceProjects: [],
  education: [],
  languages: [],
  skillGroups: [createDefaultSkillGroup()],
}

export function cloneCV(cv: CV): CV {
  return JSON.parse(JSON.stringify(cv)) as CV
}

export function createCVVersion(locale: LocaleCode, cv: CV = emptyCV, sourceVersionId: string | null = null): CVVersion {
  return {
    id: crypto.randomUUID(),
    locale,
    sourceVersionId,
    cv: cloneCV(cv),
  }
}

export function createInitialWorkspace(cv: CV = emptyCV, locale: LocaleCode = 'en'): CVWorkspace {
  const initialVersion = createCVVersion(locale, cv)

  return {
    versions: [initialVersion],
    activeVersionId: initialVersion.id,
  }
}
