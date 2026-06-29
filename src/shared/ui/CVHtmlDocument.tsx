import type { ReactNode } from 'react'
import type { CV } from '@/entities/cv/model/types'
import { cn } from '@/shared/lib/cn'
import {
  CalendarIcon,
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TelegramIcon,
  WhatsAppIcon,
} from '@/shared/ui/PdfIcons'
import { MarkdownContent } from '@/shared/ui/MarkdownContent'

export type RenderMode = 'preview' | 'print'

interface ContactItemProps {
  children: ReactNode
  href?: string
  icon: ReactNode
  rel?: string
  target?: string
}

const ContactItem = ({ children, href, icon, rel, target }: ContactItemProps) => {
  const content = (
    <>
      <span className="cv-contact-icon" aria-hidden="true">{icon}</span>
      <span className="cv-contact-text">{children}</span>
    </>
  )

  if (!href) {
    return <span className="cv-contact-item">{content}</span>
  }

  return (
    <a href={href} target={target} rel={rel} className="cv-contact-item transition-colors hover:text-gray-900">
      {content}
    </a>
  )
}

const EntryLogo = ({ src, alt }: { src?: string; alt: string }) => {
  if (!src) {
    return null
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white p-1 shadow-sm">
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
    </div>
  )
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

function formatMonthYear(value?: string): string {
  if (!value) {
    return ''
  }

  const match = value.match(/^(\d{4})-(\d{2})$/)

  if (!match) {
    return value
  }

  const [, year, monthPart] = match
  const monthIndex = Number(monthPart) - 1

  if (monthIndex < 0 || monthIndex >= MONTH_NAMES.length) {
    return value
  }

  return `${MONTH_NAMES[monthIndex]} ${year}`
}

function formatDateRange(startDate?: string, endDate?: string): string {
  const formattedStart = formatMonthYear(startDate) || 'Start'
  const formattedEnd = formatMonthYear(endDate) || 'Present'

  return `${formattedStart} - ${formattedEnd}`
}

function normalizeProjectLink(link: string): string {
  if (!link) {
    return ''
  }

  return /^https?:\/\//i.test(link) ? link : `https://${link}`
}

function getProjectLabel(link: string): string {
  if (!link) {
    return 'Project Link'
  }

  try {
    const url = new URL(normalizeProjectLink(link))
    const pathSegments = url.pathname.split('/').filter(Boolean)

    if (pathSegments.length >= 2) {
      return `${pathSegments[pathSegments.length - 2]}/${pathSegments[pathSegments.length - 1]}`
    }

    if (pathSegments.length === 1) {
      return pathSegments[0]
    }

    return url.hostname
  } catch {
    return link
  }
}

const ExperienceItem = ({ exp, className }: { exp: CV['experience'][number]; className?: string }) => (
  <div className={className}>
    <div className="flex items-start gap-3">
      <EntryLogo src={exp.logoUrl} alt={`${exp.company || 'Company'} logo`} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-4">
          <h3 className="text-md font-bold text-gray-800">{exp.position || 'Position'}</h3>
          <span className="ml-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {formatDateRange(exp.startDate, exp.endDate)}
          </span>
        </div>
        <div className="mb-2 text-md font-medium text-blue-600">{exp.company || 'Company Name'}</div>
        {exp.description && (
          <div className="cv-long-text">
            <MarkdownContent content={exp.description} className="text-sm text-gray-700" />
          </div>
        )}
      </div>
    </div>
  </div>
)

const OpenSourceProjectItem = ({
  project,
  className,
}: {
  project: CV['openSourceProjects'][number]
  className?: string
}) => {
  const projectHref = normalizeProjectLink(project.link)
  const label = getProjectLabel(project.link)

  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <EntryLogo src={project.logoUrl} alt={`${label} logo`} />
        <div className="min-w-0 flex-1">
          {projectHref ? (
            <a
              href={projectHref}
              target="_blank"
              rel="noreferrer"
              className="mb-2 inline-flex items-center gap-2 break-all text-md font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              <span className="h-4 w-4 shrink-0" aria-hidden="true">
                <GithubIcon />
              </span>
              <span>{label}</span>
            </a>
          ) : (
            <div className="mb-2 inline-flex items-center gap-2 break-all text-md font-bold text-blue-600">
              <span className="h-4 w-4 shrink-0" aria-hidden="true">
                <GithubIcon />
              </span>
              <span>{label}</span>
            </div>
          )}
          {project.description && <p className="text-sm text-gray-700">{project.description}</p>}
        </div>
      </div>
    </div>
  )
}

const EducationItem = ({ edu, className }: { edu: CV['education'][number]; className?: string }) => (
  <div className={className}>
    <div className="flex items-start gap-3">
      <EntryLogo src={edu.logoUrl} alt={`${edu.institution || 'Institution'} logo`} />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-baseline justify-between gap-4">
          <h3 className="text-md font-bold text-gray-800">{edu.degree || 'Degree'}</h3>
          <span className="ml-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {formatDateRange(edu.startDate, edu.endDate)}
          </span>
        </div>
        <div className="mb-2 text-md font-medium text-blue-600">{edu.institution || 'Institution Name'}</div>
        {edu.description && (
          <div className="cv-long-text">
            <MarkdownContent content={edu.description} className="text-sm text-gray-700" />
          </div>
        )}
      </div>
    </div>
  </div>
)

function CVHtmlDocument({ cv, mode = 'preview' }: { cv: CV; mode?: RenderMode }) {
  const { personalInfo, experience = [], openSourceProjects = [], education = [], languages = [], skills = [] } = cv

  const firstExperience = experience[0]
  const remainingExperience = experience.slice(1)
  const firstOpenSourceProject = openSourceProjects[0]
  const remainingOpenSourceProjects = openSourceProjects.slice(1)
  const firstEducation = education[0]
  const remainingEducation = education.slice(1)

  return (
    <article
      id="cv-document"
      className={cn('cv-document min-w-0 w-full bg-white text-gray-800', mode === 'preview' && 'shadow-xl')}
      data-render-mode={mode}
    >
      <header className="cv-page-block flex flex-row items-start space-x-6 border-b-2 border-gray-800 pb-6">
        {personalInfo.photoUrl && (
          <div className={`h-32 w-32 shrink-0 overflow-hidden border-2 border-gray-100 shadow-md ${personalInfo.photoShape === 'square' ? 'rounded-xl' : 'rounded-full'}`}>
            <img src={personalInfo.photoUrl} alt="Profile" className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 text-left">
          <h1 className="mb-2 text-4xl font-bold uppercase tracking-wider text-gray-900">
            {personalInfo.fullName || 'Your Name'}
          </h1>
          <p className="mb-4 text-xl font-medium text-blue-600">{personalInfo.jobTitle || 'Job Title'}</p>
          <div className="cv-contact-list text-sm text-gray-600">
            {personalInfo.email && (
              <ContactItem href={`mailto:${personalInfo.email}`} icon={<MailIcon />}>
                {personalInfo.email}
              </ContactItem>
            )}
            {personalInfo.phone && (
              <ContactItem href={`tel:${personalInfo.phone.replace(/\s/g, '')}`} icon={<PhoneIcon />}>
                {personalInfo.phone}
              </ContactItem>
            )}
            {personalInfo.whatsapp && (
              <ContactItem
                href={`https://wa.me/${personalInfo.whatsapp.replace(/[^\d+]/g, '').replace(/^\+/, '')}`}
                icon={<WhatsAppIcon />}
                rel="noreferrer"
                target="_blank"
              >
                {personalInfo.whatsapp}
              </ContactItem>
            )}
            {personalInfo.telegram && (
              <ContactItem
                href={`https://t.me/${personalInfo.telegram.replace(/^@/, '')}`}
                icon={<TelegramIcon />}
                rel="noreferrer"
                target="_blank"
              >
                {personalInfo.telegram}
              </ContactItem>
            )}
            {personalInfo.github && (
              <ContactItem
                href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`}
                icon={<GithubIcon />}
                rel="noreferrer"
                target="_blank"
              >
                {personalInfo.github}
              </ContactItem>
            )}
            {personalInfo.linkedin && (
              <ContactItem
                href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`}
                icon={<LinkedinIcon />}
                rel="noreferrer"
                target="_blank"
              >
                {personalInfo.linkedin}
              </ContactItem>
            )}
            {personalInfo.age && <ContactItem icon={<CalendarIcon />}>{personalInfo.age} y.o.</ContactItem>}
            {personalInfo.location && (
              <ContactItem
                href={`https://maps.google.com/?q=${encodeURIComponent(personalInfo.location)}`}
                icon={<MapPinIcon />}
                rel="noreferrer"
                target="_blank"
              >
                {personalInfo.location}
              </ContactItem>
            )}
          </div>
        </div>
      </header>

      {personalInfo.summary && (
        <section className="cv-flow-section cv-page-block min-w-0 w-full">
          <h2 className="mb-3 border-b border-gray-200 pb-1 text-lg font-bold uppercase tracking-widest text-gray-900">
            Professional Summary
          </h2>
          <div className="cv-long-text">
            <MarkdownContent content={personalInfo.summary} className="text-sm text-gray-700" />
          </div>
        </section>
      )}

      {experience.length > 0 && firstExperience && (
        <section className="cv-flow-section">
          <div className="cv-page-block">
            <h2 className="mb-4 border-b border-gray-200 pb-1 text-lg font-bold uppercase tracking-widest text-gray-900">
              Experience
            </h2>
            <ExperienceItem exp={firstExperience} className={remainingExperience.length > 0 ? 'mb-6' : ''} />
          </div>
          {remainingExperience.length > 0 && (
            <div className="cv-entry-list">
              {remainingExperience.map((exp) => (
                <ExperienceItem key={exp.id} exp={exp} className="cv-page-block" />
              ))}
            </div>
          )}
        </section>
      )}

      {openSourceProjects.length > 0 && firstOpenSourceProject && (
        <section className="cv-flow-section">
          <div className="cv-page-block">
            <h2 className="mb-4 border-b border-gray-200 pb-1 text-lg font-bold uppercase tracking-widest text-gray-900">
              Open Source Projects
            </h2>
            <OpenSourceProjectItem
              project={firstOpenSourceProject}
              className={remainingOpenSourceProjects.length > 0 ? 'mb-6' : ''}
            />
          </div>
          {remainingOpenSourceProjects.length > 0 && (
            <div className="cv-entry-list">
              {remainingOpenSourceProjects.map((project) => (
                <OpenSourceProjectItem key={project.id} project={project} className="cv-page-block" />
              ))}
            </div>
          )}
        </section>
      )}

      {education.length > 0 && firstEducation && (
        <section className="cv-flow-section">
          <div className="cv-page-block">
            <h2 className="mb-4 border-b border-gray-200 pb-1 text-lg font-bold uppercase tracking-widest text-gray-900">
              Education
            </h2>
            <EducationItem edu={firstEducation} className={remainingEducation.length > 0 ? 'mb-6' : ''} />
          </div>
          {remainingEducation.length > 0 && (
            <div className="cv-entry-list">
              {remainingEducation.map((edu) => (
                <EducationItem key={edu.id} edu={edu} className="cv-page-block" />
              ))}
            </div>
          )}
        </section>
      )}

      {languages.length > 0 && (
        <section className="cv-flow-section cv-page-block min-w-0 w-full">
          <h2 className="mb-4 border-b border-gray-200 pb-1 text-lg font-bold uppercase tracking-widest text-gray-900">
            Languages
          </h2>
          <div className="flex min-w-0 w-full flex-wrap gap-2 text-sm leading-relaxed text-gray-800">
            {languages.map((language) => (
              <span
                key={language.id}
                className="inline-flex max-w-full items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700"
              >
                <span className="break-words">{language.name}</span>
                <span className="mx-2 text-emerald-400">-</span>
                <span className="break-words">{language.level}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {skills.length > 0 && (
        <section className="cv-flow-section cv-page-block min-w-0 w-full">
          <h2 className="mb-4 border-b border-gray-200 pb-1 text-lg font-bold uppercase tracking-widest text-gray-900">
            Skills
          </h2>
          <div className="flex min-w-0 w-full flex-wrap gap-2 text-sm leading-relaxed text-gray-800">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex max-w-full items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-medium text-blue-700"
              >
                <span className="break-words">{skill.name}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

export { CVHtmlDocument }
export default CVHtmlDocument

