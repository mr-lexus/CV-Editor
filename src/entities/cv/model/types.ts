import type { LocaleCode } from '@/shared/i18n'

export type ExperienceYearsMode = 'hidden' | 'auto' | 'manual'

export interface PersonalInfo {
  fullName: string
  jobTitle: string
  email: string
  phone: string
  whatsapp?: string
  telegram?: string
  github?: string
  linkedin?: string
  age?: string
  location: string
  summary: string
  photoUrl?: string
  photoShape?: 'square' | 'round'
  experienceYearsMode?: ExperienceYearsMode
  manualExperienceYears?: string
}

export interface Experience {
  id: string
  company: string
  logoUrl?: string
  position: string
  startDate: string
  endDate: string
  description: string
}

export interface Skill {
  id: string
  name: string
}

export interface SkillGroup {
  id: string
  name: string
  skills: Skill[]
  isDefault?: boolean
}

export interface Language {
  id: string
  name: string
  level: string
}

export interface OpenSourceProject {
  id: string
  link: string
  logoUrl?: string
  description: string
}

export interface Education {
  id: string
  institution: string
  logoUrl?: string
  degree: string
  startDate: string
  endDate: string
  description: string
}

export interface CV {
  personalInfo: PersonalInfo
  experience: Experience[]
  openSourceProjects: OpenSourceProject[]
  education: Education[]
  languages: Language[]
  skillGroups: SkillGroup[]
}

export interface CVVersion {
  id: string
  locale: LocaleCode
  sourceVersionId?: string | null
  cv: CV
}

export interface CVWorkspace {
  versions: CVVersion[]
  activeVersionId: string
}
