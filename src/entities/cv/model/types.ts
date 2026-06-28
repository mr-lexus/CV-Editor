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
  education: Education[]
  skills: Skill[]
}
