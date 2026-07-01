import { z } from 'zod'

export const createPersonalInfoSchema = (messages: {
  nameMin: string
  jobTitleMin: string
  invalidEmail: string
}) => z.object({
  fullName: z.string().min(2, messages.nameMin),
  jobTitle: z.string().min(2, messages.jobTitleMin),
  email: z.string().email(messages.invalidEmail),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  age: z.string().optional(),
  location: z.string().optional(),
  summary: z.string().optional(),
  photoUrl: z.string().optional(),
  photoShape: z.enum(['square', 'round']).optional(),
  experienceYearsMode: z.enum(['hidden', 'auto', 'manual']).optional(),
  manualExperienceYears: z.string().optional(),
})

export const experienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  logoUrl: z.string().optional(),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
})

export const openSourceProjectSchema = z.object({
  link: z.string().min(1, 'Project link is required'),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
})

export const educationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  logoUrl: z.string().optional(),
  degree: z.string().min(1, 'Degree is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
})

export const languageSchema = z.object({
  name: z.string().min(1, 'Language is required'),
  level: z.string().min(1, 'Level is required'),
})

export const skillSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
})
