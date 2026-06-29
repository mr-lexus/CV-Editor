import type { CV } from './types'

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
  skills: [],
}
