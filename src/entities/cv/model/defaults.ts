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
  },
  experience: [],
  education: [],
  skills: [],
}
