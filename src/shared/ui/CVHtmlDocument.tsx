import type { ReactNode } from 'react'
import type { CV } from '@/entities/cv/model/types'
import { cn } from '@/shared/lib/cn'
import { formatPreviewExperience, getIntlLocale, useI18n } from '@/shared/i18n'
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
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-white p-0.5 shadow-sm">
      <img src={src} alt={alt} className="max-h-full max-w-full object-contain" />
    </div>
  )
}

function formatMonthYear(locale: string, value?: string): string {
  if (!value) {
    return ''
  }

  const yearOnlyMatch = value.match(/^(\d{4})$/)

  if (yearOnlyMatch) {
    return yearOnlyMatch[1]
  }

  const match = value.match(/^(\d{4})-(\d{2})$/)

  if (!match) {
    return value
  }

  const [, year, monthPart] = match
  const month = Number(monthPart) - 1

  if (month < 0 || month >= 12) {
    return value
  }

  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Number(year), month, 1))
}

function formatDateRange(locale: string, startLabel: string, presentLabel: string, startDate?: string, endDate?: string): string {
  const formattedStart = formatMonthYear(locale, startDate) || startLabel
  const formattedEnd = formatMonthYear(locale, endDate) || presentLabel

  return `${formattedStart} - ${formattedEnd}`
}

function parseMonthIndex(value: string | undefined, boundary: 'start' | 'end'): number | null {
  if (!value) {
    return null
  }

  const yearOnlyMatch = value.match(/^(\d{4})$/)

  if (yearOnlyMatch) {
    const year = Number(yearOnlyMatch[1])
    const month = boundary === 'start' ? 0 : 11

    return year * 12 + month
  }

  const match = value.match(/^(\d{4})-(\d{2})$/)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2]) - 1

  if (month < 0 || month >= 12) {
    return null
  }

  return year * 12 + month
}

function calculateExperienceMonths(experience: CV['experience']): number {
  const currentDate = new Date()
  const currentMonthIndex = currentDate.getFullYear() * 12 + currentDate.getMonth()
  const ranges = experience
    .map((entry) => {
      const start = parseMonthIndex(entry.startDate, 'start')
      const end = parseMonthIndex(entry.endDate, 'end') ?? currentMonthIndex

      if (start === null || end < start) {
        return null
      }

      return { start, end }
    })
    .filter((range): range is { start: number; end: number } => range !== null)
    .sort((left, right) => left.start - right.start)

  if (ranges.length === 0) {
    return 0
  }

  const mergedRanges = [{ ...ranges[0] }]

  for (const range of ranges.slice(1)) {
    const lastRange = mergedRanges[mergedRanges.length - 1]

    if (range.start <= lastRange.end + 1) {
      lastRange.end = Math.max(lastRange.end, range.end)
      continue
    }

    mergedRanges.push({ ...range })
  }

  return mergedRanges.reduce((total, range) => total + (range.end - range.start + 1), 0)
}

function formatExperienceYearsLabel(locale: string, value: string): string | null {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const numericValue = Number(trimmedValue)

  if (!Number.isNaN(numericValue)) {
    const normalizedValue = Number.isInteger(numericValue)
      ? String(numericValue)
      : numericValue.toFixed(1).replace(/\.0$/, '')

    return formatPreviewExperience(locale === 'ru-RU' ? 'ru' : 'en', normalizedValue)
  }

  return locale === 'ru-RU' ? `${trimmedValue} опыта` : `${trimmedValue} years of experience`
}

function getExperienceYearsLabel(
  locale: 'en' | 'ru',
  personalInfo: CV['personalInfo'],
  experience: CV['experience'],
  lessThanOneYearLabel: string,
): string | null {
  if (personalInfo.experienceYearsMode === 'hidden') {
    return null
  }

  if (personalInfo.experienceYearsMode === 'manual') {
    return formatExperienceYearsLabel(getIntlLocale(locale), personalInfo.manualExperienceYears || '')
  }

  const totalMonths = calculateExperienceMonths(experience)

  if (totalMonths <= 0) {
    return null
  }

  if (totalMonths < 12) {
    return lessThanOneYearLabel
  }

  const wholeYears = Math.floor(totalMonths / 12)
  const value = `${wholeYears}${totalMonths % 12 === 0 ? '' : '+'}`

  return formatPreviewExperience(locale, value)
}

function normalizeProjectLink(link: string): string {
  if (!link) {
    return ''
  }

  return /^https?:\/\//i.test(link) ? link : `https://${link}`
}

function getProjectLabel(link: string, fallbackLabel: string): string {
  if (!link) {
    return fallbackLabel
  }

  try {
    const url = new URL(normalizeProjectLink(link))
    const normalizedPath = url.pathname.replace(/\/+$/, '')

    return `${url.hostname}${normalizedPath}`
  } catch {
    return link.replace(/^https?:\/\//i, '').replace(/\/+$/, '')
  }
}

const ExperienceItem = ({
  exp,
  className,
  locale,
  startLabel,
  presentLabel,
  t,
}: {
  exp: CV['experience'][number]
  className?: string
  locale: string
  startLabel: string
  presentLabel: string
  t: (key: string, variables?: Record<string, string | number>) => string
}) => (
  <div className={className}>
    <div className="flex items-start gap-2.5">
      <EntryLogo src={exp.logoUrl} alt={`${exp.company || t('preview.placeholders.company')} ${t('preview.labels.projectLogoSuffix')}`} />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-baseline justify-between gap-3">
          <h3 className="text-md font-bold text-gray-800">{exp.position || t('preview.placeholders.position')}</h3>
          <span className="ml-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {formatDateRange(locale, startLabel, presentLabel, exp.startDate, exp.endDate)}
          </span>
        </div>
        <div className="mb-1.5 text-md font-medium text-blue-600">{exp.company || t('preview.placeholders.company')}</div>
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
  t,
}: {
  project: CV['openSourceProjects'][number]
  className?: string
  t: (key: string, variables?: Record<string, string | number>) => string
}) => {
  const projectHref = normalizeProjectLink(project.link)
  const label = getProjectLabel(project.link, t('preview.placeholders.projectLink'))

  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <EntryLogo src={project.logoUrl} alt={`${label} ${t('preview.labels.projectLogoSuffix')}`} />
        <div className="min-w-0 flex-1">
          {projectHref ? (
            <a
              href={projectHref}
              target="_blank"
              rel="noreferrer"
              className="mb-1.5 inline-flex items-center gap-2 break-all text-md font-bold text-blue-600 transition-colors hover:text-blue-700"
            >
              <span className="h-4 w-4 shrink-0" aria-hidden="true">
                <GithubIcon />
              </span>
              <span>{label}</span>
            </a>
          ) : (
            <div className="mb-1.5 inline-flex items-center gap-2 break-all text-md font-bold text-blue-600">
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

const EducationItem = ({
  edu,
  className,
  locale,
  startLabel,
  presentLabel,
  t,
}: {
  edu: CV['education'][number]
  className?: string
  locale: string
  startLabel: string
  presentLabel: string
  t: (key: string, variables?: Record<string, string | number>) => string
}) => (
  <div className={className}>
    <div className="flex items-start gap-2.5">
      <EntryLogo src={edu.logoUrl} alt={`${edu.institution || t('preview.placeholders.institution')} ${t('preview.labels.projectLogoSuffix')}`} />
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-baseline justify-between gap-3">
          <h3 className="text-md font-bold text-gray-800">{edu.degree || t('preview.placeholders.degree')}</h3>
          <span className="ml-4 whitespace-nowrap text-sm font-medium text-gray-500">
            {formatDateRange(locale, startLabel, presentLabel, edu.startDate, edu.endDate)}
          </span>
        </div>
        <div className="mb-1.5 text-md font-medium text-blue-600">{edu.institution || t('preview.placeholders.institution')}</div>
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
  const { t, locale } = useI18n()
  const { personalInfo, experience = [], openSourceProjects = [], education = [], languages = [], skillGroups = [] } = cv
  const intlLocale = getIntlLocale(locale)
  const experienceYearsLabel = getExperienceYearsLabel(
    locale,
    personalInfo,
    experience,
    t('preview.labels.lessThanOneYear'),
  )
  const startLabel = t('preview.labels.start')
  const presentLabel = t('preview.labels.present')

  const firstExperience = experience[0]
  const remainingExperience = experience.slice(1)
  const firstOpenSourceProject = openSourceProjects[0]
  const remainingOpenSourceProjects = openSourceProjects.slice(1)
  const firstEducation = education[0]
  const remainingEducation = education.slice(1)
  const visibleSkillGroups = skillGroups.filter((group) => group.skills.length > 0)
  const renderFlatSkills = visibleSkillGroups.length === 1 && visibleSkillGroups[0].isDefault

  return (
    <article
      id="cv-document"
      className={cn('cv-document min-w-0 w-full bg-white text-gray-800', mode === 'preview' && 'shadow-xl')}
      data-render-mode={mode}
    >
      <header className="cv-page-block flex flex-row items-start space-x-5 border-b-2 border-gray-800 pb-5">
        {personalInfo.photoUrl && (
          <div className={`h-28 w-28 shrink-0 overflow-hidden border-2 border-gray-100 shadow-md ${personalInfo.photoShape === 'square' ? 'rounded-xl' : 'rounded-full'}`}>
            <img src={personalInfo.photoUrl} alt={t('preview.placeholders.profilePhotoAlt')} className="h-full w-full object-cover" />
          </div>
        )}
        <div className="flex-1 text-left">
          <h1 className="mb-1.5 text-4xl font-bold uppercase tracking-wider text-gray-900">
            {personalInfo.fullName || t('preview.placeholders.fullName')}
          </h1>
          <p className={cn('text-xl font-medium text-blue-600', experienceYearsLabel ? 'mb-1.5' : 'mb-3')}>
            {personalInfo.jobTitle || t('preview.placeholders.jobTitle')}
          </p>
          {experienceYearsLabel && (
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              {experienceYearsLabel}
            </p>
          )}
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
            {personalInfo.age && <ContactItem icon={<CalendarIcon />}>{t('preview.labels.age', { value: personalInfo.age })}</ContactItem>}
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
          <h2 className="mb-2 border-b border-gray-200 pb-0.5 text-lg font-bold uppercase tracking-widest text-gray-900">
            {t('preview.sections.summary')}
          </h2>
          <div className="cv-long-text">
            <MarkdownContent content={personalInfo.summary} className="text-sm text-gray-700" />
          </div>
        </section>
      )}

      {experience.length > 0 && firstExperience && (
        <section className="cv-flow-section">
          <div className="cv-page-block">
            <h2 className="mb-3 border-b border-gray-200 pb-0.5 text-lg font-bold uppercase tracking-widest text-gray-900">
              {t('preview.sections.experience')}
            </h2>
            <ExperienceItem
              exp={firstExperience}
              className={remainingExperience.length > 0 ? 'mb-5' : ''}
              locale={intlLocale}
              startLabel={startLabel}
              presentLabel={presentLabel}
              t={t}
            />
          </div>
          {remainingExperience.length > 0 && (
            <div className="cv-entry-list">
              {remainingExperience.map((exp) => (
                <ExperienceItem
                  key={exp.id}
                  exp={exp}
                  className="cv-page-block"
                  locale={intlLocale}
                  startLabel={startLabel}
                  presentLabel={presentLabel}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {openSourceProjects.length > 0 && firstOpenSourceProject && (
        <section className="cv-flow-section">
          <div className="cv-page-block">
            <h2 className="mb-3 border-b border-gray-200 pb-0.5 text-lg font-bold uppercase tracking-widest text-gray-900">
              {t('preview.sections.projects')}
            </h2>
            <OpenSourceProjectItem
              project={firstOpenSourceProject}
              className={remainingOpenSourceProjects.length > 0 ? 'mb-5' : ''}
              t={t}
            />
          </div>
          {remainingOpenSourceProjects.length > 0 && (
            <div className="cv-entry-list">
              {remainingOpenSourceProjects.map((project) => (
                <OpenSourceProjectItem key={project.id} project={project} className="cv-page-block" t={t} />
              ))}
            </div>
          )}
        </section>
      )}

      {education.length > 0 && firstEducation && (
        <section className="cv-flow-section">
          <div className="cv-page-block">
            <h2 className="mb-3 border-b border-gray-200 pb-0.5 text-lg font-bold uppercase tracking-widest text-gray-900">
              {t('preview.sections.education')}
            </h2>
            <EducationItem
              edu={firstEducation}
              className={remainingEducation.length > 0 ? 'mb-5' : ''}
              locale={intlLocale}
              startLabel={startLabel}
              presentLabel={presentLabel}
              t={t}
            />
          </div>
          {remainingEducation.length > 0 && (
            <div className="cv-entry-list">
              {remainingEducation.map((edu) => (
                <EducationItem
                  key={edu.id}
                  edu={edu}
                  className="cv-page-block"
                  locale={intlLocale}
                  startLabel={startLabel}
                  presentLabel={presentLabel}
                  t={t}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {languages.length > 0 && (
        <section className="cv-flow-section cv-page-block min-w-0 w-full">
          <h2 className="mb-3 border-b border-gray-200 pb-0.5 text-lg font-bold uppercase tracking-widest text-gray-900">
            {t('preview.sections.languages')}
          </h2>
          <div className="flex min-w-0 w-full flex-wrap gap-1.5 text-sm leading-tight text-gray-800">
            {languages.map((language) => (
              <span
                key={language.id}
                className="inline-flex max-w-full items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700"
              >
                <span className="break-words">{language.name}</span>
                <span className="mx-1.5 text-emerald-400">-</span>
                <span className="break-words">{language.level}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {visibleSkillGroups.length > 0 && (
        <section className="cv-flow-section cv-page-block min-w-0 w-full">
          <h2 className="mb-2 border-b border-gray-200 pb-0.5 text-lg font-bold uppercase tracking-widest text-gray-900">
            {t('preview.sections.skills')}
          </h2>
          {renderFlatSkills ? (
            <div className="flex min-w-0 w-full flex-wrap gap-1 text-xs leading-tight text-gray-800">
              {visibleSkillGroups[0].skills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex max-w-full items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-medium text-blue-700"
                >
                  <span className="break-words">{skill.name}</span>
                </span>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {visibleSkillGroups.map((group) => (
                <div key={group.id} className="min-w-0">
                  {!group.isDefault && (
                    <h3 className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-900">
                      {group.name}
                    </h3>
                  )}
                  <div className="flex min-w-0 w-full flex-wrap gap-1 text-xs leading-tight text-gray-800">
                    {group.skills.map((skill) => (
                      <span
                        key={skill.id}
                        className="inline-flex max-w-full items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-medium text-blue-700"
                      >
                        <span className="break-words">{skill.name}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </article>
  )
}

export { CVHtmlDocument }
export default CVHtmlDocument





