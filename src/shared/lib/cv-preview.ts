import type { CV } from '@/entities/cv/model/types'
import { createDefaultSkillGroup, emptyCV } from '@/entities/cv/model/defaults'
import type { RenderMode } from '@/shared/ui/CVHtmlDocument'

const PREVIEW_DATA_PARAM = 'data'
const PRINT_MODE = 'print'
const PRINT_PREVIEW_PATH = '/cv/preview'
const baseUrl = import.meta.env.BASE_URL || '/'

const configuredPdfApiUrl = import.meta.env.VITE_PDF_API_URL

if (configuredPdfApiUrl && !/^https?:\/\//.test(configuredPdfApiUrl)) {
  throw new Error('VITE_PDF_API_URL must be an absolute URL when provided.')
}

declare global {
  interface Window {
    __CV_PRINT_DATA__?: unknown
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function encodeBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input)
  let binary = ''

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000))
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4))
  const binary = atob(`${normalized}${padding}`)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))

  return new TextDecoder().decode(bytes)
}

function normalizeExperience(value: unknown, index: number): CV['experience'][number] | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: readString(value.id) || `experience-${index}`,
    company: readString(value.company),
    logoUrl: readString(value.logoUrl),
    position: readString(value.position),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  }
}

function normalizeOpenSourceProject(value: unknown, index: number): CV['openSourceProjects'][number] | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: readString(value.id) || `open-source-project-${index}`,
    link: readString(value.link),
    logoUrl: readString(value.logoUrl),
    description: readString(value.description),
  }
}

function normalizeEducation(value: unknown, index: number): CV['education'][number] | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: readString(value.id) || `education-${index}`,
    institution: readString(value.institution),
    logoUrl: readString(value.logoUrl),
    degree: readString(value.degree),
    startDate: readString(value.startDate),
    endDate: readString(value.endDate),
    description: readString(value.description),
  }
}

function normalizeLanguage(value: unknown, index: number): CV['languages'][number] | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: readString(value.id) || `language-${index}`,
    name: readString(value.name),
    level: readString(value.level),
  }
}

function normalizeSkill(value: unknown, index: number): CV['skillGroups'][number]['skills'][number] | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: readString(value.id) || `skill-${index}`,
    name: readString(value.name),
  }
}

function normalizeSkillGroup(value: unknown, index: number): CV['skillGroups'][number] | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    id: readString(value.id) || `skill-group-${index}`,
    name: readString(value.name),
    isDefault: value.isDefault === true,
    skills: Array.isArray(value.skills)
      ? value.skills
          .map((entry, skillIndex) => normalizeSkill(entry, skillIndex))
          .filter((entry): entry is CV['skillGroups'][number]['skills'][number] => entry !== null)
      : [],
  }
}

function normalizeCV(value: unknown): CV {
  if (!isRecord(value)) {
    return emptyCV
  }

  const personalInfo = isRecord(value.personalInfo) ? value.personalInfo : {}

  return {
    personalInfo: {
      ...emptyCV.personalInfo,
      fullName: readString(personalInfo.fullName),
      jobTitle: readString(personalInfo.jobTitle),
      email: readString(personalInfo.email),
      phone: readString(personalInfo.phone),
      whatsapp: readString(personalInfo.whatsapp),
      telegram: readString(personalInfo.telegram),
      github: readString(personalInfo.github),
      linkedin: readString(personalInfo.linkedin),
      age: readString(personalInfo.age),
      location: readString(personalInfo.location),
      summary: readString(personalInfo.summary),
      photoUrl: readString(personalInfo.photoUrl),
      photoShape: personalInfo.photoShape === 'square' ? 'square' : 'round',
      experienceYearsMode:
        personalInfo.experienceYearsMode === 'hidden' || personalInfo.experienceYearsMode === 'manual'
          ? personalInfo.experienceYearsMode
          : 'auto',
      manualExperienceYears: readString(personalInfo.manualExperienceYears),
    },
    experience: Array.isArray(value.experience)
      ? value.experience
          .map((entry, index) => normalizeExperience(entry, index))
          .filter((entry): entry is CV['experience'][number] => entry !== null)
      : [],
    openSourceProjects: Array.isArray(value.openSourceProjects)
      ? value.openSourceProjects
          .map((entry, index) => normalizeOpenSourceProject(entry, index))
          .filter((entry): entry is CV['openSourceProjects'][number] => entry !== null)
      : [],
    education: Array.isArray(value.education)
      ? value.education
          .map((entry, index) => normalizeEducation(entry, index))
          .filter((entry): entry is CV['education'][number] => entry !== null)
      : [],
    languages: Array.isArray(value.languages)
      ? value.languages
          .map((entry, index) => normalizeLanguage(entry, index))
          .filter((entry): entry is CV['languages'][number] => entry !== null)
      : [],
    skillGroups: Array.isArray(value.skillGroups)
      ? value.skillGroups
          .map((entry, index) => normalizeSkillGroup(entry, index))
          .filter((entry): entry is CV['skillGroups'][number] => entry !== null)
      : [createDefaultSkillGroup(
          Array.isArray(value.skills)
            ? value.skills
                .map((entry, index) => normalizeSkill(entry, index))
                .filter((entry): entry is CV['skillGroups'][number]['skills'][number] => entry !== null)
            : [],
        )],
  }
}

function readQueryCVData(search: string): CV | null {
  const params = new URLSearchParams(search)
  const encodedData = params.get(PREVIEW_DATA_PARAM)

  if (!encodedData) {
    return null
  }

  try {
    return normalizeCV(JSON.parse(decodeBase64Url(encodedData)))
  } catch {
    return null
  }
}

function readInjectedCVData(): CV | null {
  return window.__CV_PRINT_DATA__ ? normalizeCV(window.__CV_PRINT_DATA__) : null
}

export function encodeCVData(cv: CV): string {
  return encodeBase64Url(JSON.stringify(cv))
}

export function buildCVPreviewUrl(origin: string, cv?: CV): string {
  const previewUrl = new URL(baseUrl, origin)
  previewUrl.searchParams.set('mode', PRINT_MODE)

  if (cv) {
    previewUrl.searchParams.set(PREVIEW_DATA_PARAM, encodeCVData(cv))
  }

  return previewUrl.toString()
}

export function isPrintPreviewPath(pathname: string): boolean {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/'
  return normalizedPath.endsWith(PRINT_PREVIEW_PATH)
}

export function readCVDataFromSearch(search: string): CV {
  return readQueryCVData(search) || readInjectedCVData() || emptyCV
}

export function getRenderModeFromSearch(search: string): RenderMode {
  const params = new URLSearchParams(search)
  return params.get('mode') === PRINT_MODE ? PRINT_MODE : 'preview'
}

export const PDF_API_ENDPOINT = configuredPdfApiUrl || '/api/pdf/generate'
