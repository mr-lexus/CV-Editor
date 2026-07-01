import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocaleCode } from '@/shared/i18n'
import { cloneCV, createCVVersion, createDefaultSkillGroup, createInitialWorkspace, DEFAULT_SKILL_GROUP_ID, emptyCV } from './defaults'
import type { CV, CVVersion, CVWorkspace, Education, Experience, Language, OpenSourceProject, PersonalInfo, Skill, SkillGroup } from './types'

interface CreateLocalizedVersionResult {
  status: 'created' | 'activated-existing'
  versionId: string
}

export interface CVState {
  workspace: CVWorkspace
  setActiveVersion: (id: string) => void
  createLocalizedVersion: (locale: LocaleCode, sourceVersionId?: string | null) => CreateLocalizedVersionResult | null
  deleteVersion: (id: string) => boolean
  replaceWorkspace: (value: unknown) => boolean
  setPersonalInfo: (info: PersonalInfo) => void
  addExperience: (exp: Experience) => void
  updateExperience: (id: string, exp: Partial<Experience>) => void
  removeExperience: (id: string) => void
  addOpenSourceProject: (project: OpenSourceProject) => void
  updateOpenSourceProject: (id: string, project: Partial<OpenSourceProject>) => void
  removeOpenSourceProject: (id: string) => void
  addEducation: (edu: Education) => void
  updateEducation: (id: string, edu: Partial<Education>) => void
  removeEducation: (id: string) => void
  addLanguage: (language: Language) => void
  removeLanguage: (id: string) => void
  addSkillGroup: (name: string) => void
  updateSkillGroup: (id: string, name: string) => void
  removeSkillGroup: (id: string) => void
  moveSkillGroup: (groupId: string, targetIndex: number) => void
  addSkill: (skill: Skill, groupId?: string) => void
  removeSkill: (id: string) => void
  moveSkill: (skillId: string, targetGroupId: string, targetIndex: number) => void
  resetCV: () => void
}

function normalizeLocale(locale: unknown): LocaleCode {
  return locale === 'ru' ? 'ru' : 'en'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeSkill(value: unknown, index: number): Skill | null {
  if (!isRecord(value)) {
    return null
  }

  const name = readString(value.name).trim()

  if (!name) {
    return null
  }

  return {
    id: readString(value.id) || `skill-${index}`,
    name,
  }
}

function normalizeSkillGroups(value: unknown): SkillGroup[] {
  if (Array.isArray(value)) {
    const groups = value
      .filter(isRecord)
      .map((group, groupIndex) => {
        const skills = Array.isArray(group.skills)
          ? group.skills
              .map((skill, skillIndex) => normalizeSkill(skill, skillIndex))
              .filter((skill): skill is Skill => skill !== null)
          : []

        return {
          id: readString(group.id) || `skill-group-${groupIndex}`,
          name: readString(group.name),
          skills,
          isDefault: group.isDefault === true || readString(group.id) === DEFAULT_SKILL_GROUP_ID,
        }
      })

    return ensureSkillGroups(groups)
  }

  return ensureSkillGroups()
}

function normalizeLegacySkills(value: unknown): Skill[] {
  return Array.isArray(value)
    ? value
        .map((skill, index) => normalizeSkill(skill, index))
        .filter((skill): skill is Skill => skill !== null)
    : []
}

function ensureSkillGroups(groups: SkillGroup[] = []): SkillGroup[] {
  const normalizedGroups = groups.map((group, index) => ({
    id: group.id || `skill-group-${index}`,
    name: group.name ?? '',
    skills: Array.isArray(group.skills) ? group.skills : [],
    isDefault: group.isDefault === true || group.id === DEFAULT_SKILL_GROUP_ID,
  }))

  const defaultGroupIndex = normalizedGroups.findIndex((group) => group.isDefault)

  if (defaultGroupIndex === -1) {
    return [createDefaultSkillGroup(), ...normalizedGroups]
  }

  return normalizedGroups.map((group, index) => {
    if (index === defaultGroupIndex) {
      return {
        ...group,
        id: DEFAULT_SKILL_GROUP_ID,
        isDefault: true,
        name: '',
      }
    }

    return {
      ...group,
      isDefault: false,
    }
  })
}

function moveSkillGroupInList(groups: SkillGroup[], groupId: string, targetIndex: number): SkillGroup[] {
  const normalizedGroups = ensureSkillGroups(groups)
  const sourceIndex = normalizedGroups.findIndex((group) => group.id === groupId)

  if (sourceIndex === -1) {
    return normalizedGroups
  }

  const nextIndex = Math.max(0, Math.min(targetIndex, normalizedGroups.length - 1))

  if (sourceIndex === nextIndex) {
    return normalizedGroups
  }

  const nextGroups = [...normalizedGroups]
  const [movedGroup] = nextGroups.splice(sourceIndex, 1)
  nextGroups.splice(nextIndex, 0, movedGroup)

  return nextGroups
}

function moveSkillInGroups(groups: SkillGroup[], skillId: string, targetGroupId: string, targetIndex: number): SkillGroup[] {
  const normalizedGroups = ensureSkillGroups(groups)
  const sourceGroupIndex = normalizedGroups.findIndex((group) => group.skills.some((skill) => skill.id === skillId))
  const targetGroupIndex = normalizedGroups.findIndex((group) => group.id === targetGroupId)

  if (sourceGroupIndex === -1 || targetGroupIndex === -1) {
    return normalizedGroups
  }

  const sourceGroup = normalizedGroups[sourceGroupIndex]
  const sourceSkillIndex = sourceGroup.skills.findIndex((skill) => skill.id === skillId)

  if (sourceSkillIndex === -1) {
    return normalizedGroups
  }

  const [movedSkill] = sourceGroup.skills.slice(sourceSkillIndex, sourceSkillIndex + 1)
  const groupsWithoutSkill = normalizedGroups.map((group, index) => (
    index === sourceGroupIndex
      ? { ...group, skills: group.skills.filter((skill) => skill.id !== skillId) }
      : group
  ))

  const destinationGroup = groupsWithoutSkill[targetGroupIndex]
  const sameGroupMove = sourceGroupIndex === targetGroupIndex
  const adjustedTargetIndex = sameGroupMove && sourceSkillIndex < targetIndex
    ? targetIndex - 1
    : targetIndex
  const nextIndex = Math.max(0, Math.min(adjustedTargetIndex, destinationGroup.skills.length))

  return groupsWithoutSkill.map((group, index) => {
    if (index !== targetGroupIndex) {
      return group
    }

    const nextSkills = [...group.skills]
    nextSkills.splice(nextIndex, 0, movedSkill)

    return {
      ...group,
      skills: nextSkills,
    }
  })
}

function normalizeCV(value: unknown): CV {
  const candidate = isRecord(value) ? value : {}
  const personalInfo = isRecord(candidate.personalInfo) ? candidate.personalInfo : {}
  const skillGroups = 'skillGroups' in candidate
    ? normalizeSkillGroups(candidate.skillGroups)
    : ensureSkillGroups([
        createDefaultSkillGroup(normalizeLegacySkills(candidate.skills)),
      ])

  return {
    personalInfo: {
      ...emptyCV.personalInfo,
      ...personalInfo,
    },
    experience: Array.isArray(candidate.experience) ? (candidate.experience as CV['experience']) : [],
    openSourceProjects: Array.isArray(candidate.openSourceProjects)
      ? (candidate.openSourceProjects as CV['openSourceProjects'])
      : [],
    education: Array.isArray(candidate.education) ? (candidate.education as CV['education']) : [],
    languages: Array.isArray(candidate.languages) ? (candidate.languages as CV['languages']) : [],
    skillGroups,
  }
}

function getActiveVersion(workspace: CVWorkspace): CVVersion {
  return workspace.versions.find((version) => version.id === workspace.activeVersionId) ?? workspace.versions[0]
}

function updateActiveVersion(workspace: CVWorkspace, updater: (cv: CV) => CV): CVWorkspace {
  const activeVersion = getActiveVersion(workspace)

  return {
    ...workspace,
    versions: workspace.versions.map((version) => (
      version.id === activeVersion.id
        ? { ...version, cv: updater(version.cv) }
        : version
    )),
  }
}

function normalizeWorkspace(value: unknown): CVWorkspace {
  if (!isRecord(value)) {
    return createInitialWorkspace()
  }

  const versions = Array.isArray(value.versions) ? value.versions : []
  const normalizedVersions = versions
    .filter(isRecord)
    .map((version) => ({
      id: typeof version.id === 'string' && version.id ? version.id : crypto.randomUUID(),
      locale: normalizeLocale(version.locale),
      sourceVersionId: typeof version.sourceVersionId === 'string' ? version.sourceVersionId : null,
      cv: normalizeCV(version.cv),
    }))

  if (normalizedVersions.length === 0) {
    return createInitialWorkspace()
  }

  const activeVersionId = typeof value.activeVersionId === 'string' && normalizedVersions.some((version) => version.id === value.activeVersionId)
    ? value.activeVersionId
    : normalizedVersions[0].id

  return {
    versions: normalizedVersions,
    activeVersionId,
  }
}

function readImportedWorkspace(value: unknown): CVWorkspace {
  if (!isRecord(value)) {
    return createInitialWorkspace()
  }

  if (value.workspace) {
    return normalizeWorkspace(value.workspace)
  }

  if (value.cv) {
    return createInitialWorkspace(normalizeCV(value.cv), 'en')
  }

  return normalizeWorkspace(value)
}

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      workspace: createInitialWorkspace(),
      setActiveVersion: (id) =>
        set((state) => {
          if (!state.workspace.versions.some((version) => version.id === id)) {
            return state
          }

          return {
            workspace: {
              ...state.workspace,
              activeVersionId: id,
            },
          }
        }),
      createLocalizedVersion: (locale, sourceVersionId) => {
        let result: CreateLocalizedVersionResult | null = null

        set((state) => {
          const existingVersion = state.workspace.versions.find((version) => version.locale === locale)

          if (existingVersion) {
            result = {
              status: 'activated-existing',
              versionId: existingVersion.id,
            }

            return {
              workspace: {
                ...state.workspace,
                activeVersionId: existingVersion.id,
              },
            }
          }

          const sourceVersion = sourceVersionId
            ? state.workspace.versions.find((version) => version.id === sourceVersionId) ?? getActiveVersion(state.workspace)
            : null
          const nextVersion = createCVVersion(
            locale,
            sourceVersion ? sourceVersion.cv : emptyCV,
            sourceVersion?.id ?? null,
          )

          result = {
            status: 'created',
            versionId: nextVersion.id,
          }

          return {
            workspace: {
              versions: [...state.workspace.versions, nextVersion],
              activeVersionId: nextVersion.id,
            },
          }
        })

        return result
      },
      deleteVersion: (id) => {
        let deleted = false

        set((state) => {
          if (state.workspace.versions.length <= 1 || !state.workspace.versions.some((version) => version.id === id)) {
            return state
          }

          const remainingVersions = state.workspace.versions.filter((version) => version.id !== id)
          const nextActiveVersionId = state.workspace.activeVersionId === id
            ? remainingVersions[Math.max(0, state.workspace.versions.findIndex((version) => version.id === id) - 1)]?.id ?? remainingVersions[0].id
            : state.workspace.activeVersionId

          deleted = true

          return {
            workspace: {
              versions: remainingVersions,
              activeVersionId: nextActiveVersionId,
            },
          }
        })

        return deleted
      },
      replaceWorkspace: (value) => {
        let replaced = false

        set(() => {
          const workspace = readImportedWorkspace(value)
          replaced = workspace.versions.length > 0

          return {
            workspace,
          }
        })

        return replaced
      },
      setPersonalInfo: (info) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({ ...cv, personalInfo: info })),
        })),
      addExperience: (exp) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            experience: [...cv.experience, exp],
          })),
        })),
      updateExperience: (id, exp) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            experience: cv.experience.map((entry) => (entry.id === id ? { ...entry, ...exp } : entry)),
          })),
        })),
      removeExperience: (id) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            experience: cv.experience.filter((entry) => entry.id !== id),
          })),
        })),
      addOpenSourceProject: (project) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            openSourceProjects: [...cv.openSourceProjects, project],
          })),
        })),
      updateOpenSourceProject: (id, project) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            openSourceProjects: cv.openSourceProjects.map((entry) => (
              entry.id === id ? { ...entry, ...project } : entry
            )),
          })),
        })),
      removeOpenSourceProject: (id) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            openSourceProjects: cv.openSourceProjects.filter((entry) => entry.id !== id),
          })),
        })),
      addEducation: (edu) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            education: [...cv.education, edu],
          })),
        })),
      updateEducation: (id, edu) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            education: cv.education.map((entry) => (entry.id === id ? { ...entry, ...edu } : entry)),
          })),
        })),
      removeEducation: (id) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            education: cv.education.filter((entry) => entry.id !== id),
          })),
        })),
      addLanguage: (language) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            languages: [...cv.languages, language],
          })),
        })),
      removeLanguage: (id) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            languages: cv.languages.filter((language) => language.id !== id),
          })),
        })),
      addSkillGroup: (name) =>
        set((state) => {
          const nextName = name.trim()

          if (!nextName) {
            return state
          }

          return {
            workspace: updateActiveVersion(state.workspace, (cv) => ({
              ...cv,
              skillGroups: [
                ...ensureSkillGroups(cv.skillGroups),
                {
                  id: crypto.randomUUID(),
                  name: nextName,
                  skills: [],
                  isDefault: false,
                },
              ],
            })),
          }
        }),
      updateSkillGroup: (id, name) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            skillGroups: ensureSkillGroups(cv.skillGroups).map((group) => (
              group.id === id && !group.isDefault
                ? { ...group, name: name.trim() }
                : group
            )),
          })),
        })),
      removeSkillGroup: (id) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => {
            const skillGroups = ensureSkillGroups(cv.skillGroups)

            if (id === DEFAULT_SKILL_GROUP_ID) {
              return {
                ...cv,
                skillGroups,
              }
            }

            const removedGroup = skillGroups.find((group) => group.id === id)

            if (!removedGroup) {
              return {
                ...cv,
                skillGroups,
              }
            }

            return {
              ...cv,
              skillGroups: skillGroups
                .filter((group) => group.id !== id)
                .map((group) => (
                  group.id === DEFAULT_SKILL_GROUP_ID
                    ? { ...group, skills: [...group.skills, ...removedGroup.skills] }
                    : group
                )),
            }
          }),
        })),
      moveSkillGroup: (groupId, targetIndex) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            skillGroups: moveSkillGroupInList(cv.skillGroups, groupId, targetIndex),
          })),
        })),
      addSkill: (skill, groupId = DEFAULT_SKILL_GROUP_ID) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => {
            const skillGroups = ensureSkillGroups(cv.skillGroups)
            const targetGroupId = skillGroups.some((group) => group.id === groupId) ? groupId : DEFAULT_SKILL_GROUP_ID

            return {
              ...cv,
              skillGroups: skillGroups.map((group) => (
                group.id === targetGroupId
                ? { ...group, skills: [...group.skills, skill] }
                : group
              )),
            }
          }),
        })),
      removeSkill: (id) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            skillGroups: ensureSkillGroups(cv.skillGroups).map((group) => ({
              ...group,
              skills: group.skills.filter((skill) => skill.id !== id),
            })),
          })),
        })),
      moveSkill: (skillId, targetGroupId, targetIndex) =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, (cv) => ({
            ...cv,
            skillGroups: moveSkillInGroups(cv.skillGroups, skillId, targetGroupId, targetIndex),
          })),
        })),
      resetCV: () =>
        set((state) => ({
          workspace: updateActiveVersion(state.workspace, () => cloneCV(emptyCV)),
        })),
    }),
    {
      name: 'cv-storage',
      merge: (persistedState, currentState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState
        }

        return {
          ...currentState,
          workspace: readImportedWorkspace(persistedState),
        }
      },
    },
  ),
)
