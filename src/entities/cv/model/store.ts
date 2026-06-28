import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CV, Experience, Education, PersonalInfo, Skill } from './types'

interface CVState {
  cv: CV
  setPersonalInfo: (info: PersonalInfo) => void
  addExperience: (exp: Experience) => void
  updateExperience: (id: string, exp: Partial<Experience>) => void
  removeExperience: (id: string) => void
  addEducation: (edu: Education) => void
  updateEducation: (id: string, edu: Partial<Education>) => void
  removeEducation: (id: string) => void
  addSkill: (skill: Skill) => void
  removeSkill: (id: string) => void
  resetCV: () => void
}

const initialState: CV = {
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
  },
  experience: [],
  education: [],
  skills: [],
}

export const useCVStore = create<CVState>()(
  persist(
    (set) => ({
      cv: initialState,
      setPersonalInfo: (info) =>
        set((state) => ({ cv: { ...state.cv, personalInfo: info } })),
      addExperience: (exp) =>
        set((state) => ({ cv: { ...state.cv, experience: [...(state.cv.experience || []), exp] } })),
      updateExperience: (id, exp) =>
        set((state) => ({
          cv: {
            ...state.cv,
            experience: (state.cv.experience || []).map((e) => (e.id === id ? { ...e, ...exp } : e)),
          },
        })),
      removeExperience: (id) =>
        set((state) => ({
          cv: {
            ...state.cv,
            experience: (state.cv.experience || []).filter((e) => e.id !== id),
          },
        })),
      addEducation: (edu) =>
        set((state) => ({ cv: { ...state.cv, education: [...(state.cv.education || []), edu] } })),
      updateEducation: (id, edu) =>
        set((state) => ({
          cv: {
            ...state.cv,
            education: (state.cv.education || []).map((e) => (e.id === id ? { ...e, ...edu } : e)),
          },
        })),
      removeEducation: (id) =>
        set((state) => ({
          cv: {
            ...state.cv,
            education: (state.cv.education || []).filter((e) => e.id !== id),
          },
        })),
      addSkill: (skill) =>
        set((state) => ({ cv: { ...state.cv, skills: [...(state.cv.skills || []), skill] } })),
      removeSkill: (id) =>
        set((state) => ({
          cv: { ...state.cv, skills: (state.cv.skills || []).filter((s) => s.id !== id) },
        })),
      resetCV: () => set({ cv: initialState }),
    }),
    {
      name: 'cv-storage',
    }
  )
)
