import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type LocaleCode = 'en' | 'ru'

type TranslationLeaf = string
type TranslationNode = {
  [key: string]: TranslationLeaf | TranslationNode
}

interface TranslationContextValue {
  locale: LocaleCode
  t: (key: string, variables?: Record<string, string | number>) => string
}

interface LocaleOption {
  code: LocaleCode
  label: string
  nativeLabel: string
  bcp47: string
}

const localeOptions: LocaleOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', bcp47: 'en-US' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', bcp47: 'ru-RU' },
]

const translations: Record<LocaleCode, TranslationNode> = {
  en: {
    common: {
      add: 'Add',
      cancel: 'Cancel',
      create: 'Create',
      import: 'Import',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      remove: 'Remove',
      save: 'Save',
      reset: 'Reset',
      current: 'Current',
      base: 'Base',
      export: 'Export',
      close: 'Close',
      open: 'Open',
    },
    workspace: {
      title: 'Multilingual CV',
      subtitle: 'Each tab is a separate localized CV. Static labels switch automatically, while your content is copied from the selected base version.',
      createAnotherLanguage: 'Another language',
      chooseLanguage: 'Language',
      chooseBase: 'Use as base',
      createVersion: 'Create version',
      createdFromScratch: 'Created from scratch',
      deleteConfirm: 'Delete the {{language}} version? This action cannot be undone.',
      deleteVersion: 'Delete version',
      emptyBase: 'Start from scratch',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      importInvalid: 'The selected file does not contain a valid CV workspace.',
      importReplaceConfirm: 'Replace the current workspace with data from the JSON file?',
      lastVersionLocked: 'At least one version must remain.',
      openVersion: 'Open version',
      originalBadge: 'Original',
      basedOn: 'Based on {{language}}',
      createdFrom: 'Created from {{language}}',
      helper: 'Create a new language version from any existing CV tab.',
    },
    export: {
      single: 'Export PDF',
      multiple: 'Export all CVs',
      singleLoading: 'Generating PDF...',
      multipleLoading: 'Preparing archive...',
      error: 'Export failed.',
      archiveSuffix: 'cv-bundle',
    },
    editor: {
      title: 'CV Editor',
      resetCurrent: 'Reset current version',
      resetCurrentConfirm: 'Reset the current version? This action cannot be undone.',
    },
    personalInfo: {
      title: 'Personal Information',
      noPhoto: 'No Photo',
      uploadPhoto: 'Upload Photo',
      removePhoto: 'Remove Photo',
      cropPhoto: 'Crop Photo',
      zoom: 'Zoom',
      shape: 'Shape',
      round: 'Round',
      square: 'Square',
      fullName: 'Full Name',
      jobTitle: 'Job Title',
      email: 'Email',
      phone: 'Phone',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      age: 'Age',
      location: 'Location',
      summary: 'Summary',
      experienceYears: 'Experience Years',
      doNotShow: 'Do not show',
      calculateFromExperience: 'Calculate from experience',
      enterManually: 'Enter manually',
      manualExperienceYears: 'Manual Experience Years',
      placeholders: {
        fullName: 'John Doe',
        jobTitle: 'Frontend Developer',
        email: 'john@example.com',
        phone: '+1 234 567 890',
        telegram: '@username',
        github: 'github.com/username',
        linkedin: 'linkedin.com/in/username',
        age: '25',
        location: 'New York, USA',
        summary: 'A brief summary about yourself...',
        manualExperienceYears: '5',
      },
      validation: {
        nameMin: 'Name must be at least 2 characters',
        jobTitleMin: 'Job title must be at least 2 characters',
        invalidEmail: 'Invalid email address',
      },
    },
    experience: {
      title: 'Experience',
      companyLogo: 'Company Logo',
      uploadLogo: 'Upload Logo',
      removeLogo: 'Remove Logo',
      company: 'Company',
      position: 'Position',
      startDate: 'Start Date',
      endDate: 'End Date',
      description: 'Description',
      empty: 'No experience added yet.',
      placeholders: {
        company: 'Tech Inc.',
        position: 'Senior Developer',
        description: 'Describe your responsibilities and achievements...',
      },
    },
    projects: {
      title: 'Open Source Projects',
      projectLogo: 'Project Logo',
      uploadLogo: 'Upload Logo',
      removeLogo: 'Remove Logo',
      projectLink: 'Project Link',
      shortDescription: 'Short Description',
      empty: 'No open source projects added yet.',
      placeholders: {
        link: 'https://github.com/username/project',
        description: 'A brief summary of the project, stack, or your contribution...',
      },
    },
    education: {
      title: 'Education',
      institutionLogo: 'Institution Logo',
      uploadLogo: 'Upload Logo',
      removeLogo: 'Remove Logo',
      institution: 'Institution',
      degree: 'Degree / Major',
      startDate: 'Start Date',
      endDate: 'End Date',
      description: 'Description',
      empty: 'No education added yet.',
      placeholders: {
        institution: 'University Name',
        degree: 'Bachelor of Science in Computer Science',
        description: 'Describe your studies, achievements, or honors...',
      },
    },
    languages: {
      title: 'Languages',
      namePlaceholder: 'e.g. English',
      levelPlaceholder: 'Select level',
      levels: {
        a1: 'A1 - Elementary',
        a2: 'A2 - Pre-Intermediate',
        b1: 'B1 - Intermediate',
        b2: 'B2 - Upper-Intermediate',
        c1: 'C1 - Advanced',
        c2: 'C2 - Proficient',
        native: 'Native',
      },
    },
    skills: {
      title: 'Skills',
      placeholder: 'e.g. React, TypeScript, Node.js',
      defaultGroup: 'Main Group',
      createGroupPlaceholder: 'New group name',
      groupPlaceholder: 'Group name',
      addGroup: 'Add group',
      deleteGroup: 'Delete group',
      dragHint: 'Drag skills between groups to reorder them.',
    },
    dateInput: {
      month: 'Month',
      monthOptional: 'Month (optional)',
      year: 'Year',
      months: {
        '01': 'January',
        '02': 'February',
        '03': 'March',
        '04': 'April',
        '05': 'May',
        '06': 'June',
        '07': 'July',
        '08': 'August',
        '09': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
      },
    },
    richText: {
      placeholder: 'Enter text...',
      keyboardShortcuts: 'Keyboard Shortcuts',
      removeFormattingHint: 'Press again to remove formatting',
      linkPrompt: 'Link URL:',
      preview: 'Preview',
      markdown: 'Markdown',
      visual: 'Visual',
      modeShortMarkdown: 'MD',
      modeShortVisual: 'Visual',
      toggleModeTitle: 'Toggle mode (Ctrl+M) - current: {{mode}}',
      actions: {
        bold: 'Bold',
        italic: 'Italic',
        underline: 'Underline',
        strikethrough: 'Strikethrough',
        inlineCode: 'Inline code',
        heading2: 'Heading H2',
        heading3: 'Heading H3',
        bulletList: 'Bullet List',
        numberedList: 'Numbered List',
        taskList: 'Task List',
        blockquote: 'Blockquote',
        horizontalRule: 'Horizontal Rule',
        link: 'Link',
      },
    },
    preview: {
      placeholders: {
        profilePhotoAlt: 'Profile',
        fullName: 'Your Name',
        jobTitle: 'Job Title',
        company: 'Company Name',
        companyLogo: 'Company logo',
        position: 'Position',
        institution: 'Institution Name',
        institutionLogo: 'Institution logo',
        degree: 'Degree',
        projectLogo: 'Project logo',
        projectLink: 'Project Link',
      },
      sections: {
        summary: 'Professional Summary',
        experience: 'Experience',
        projects: 'Open Source Projects',
        education: 'Education',
        languages: 'Languages',
        skills: 'Skills',
      },
      labels: {
        start: 'Start',
        present: 'Present',
        age: '{{value}} years old',
        lessThanOneYear: 'Less than 1 year of experience',
        yearOfExperience_one: '{{value}} year of experience',
        yearOfExperience_other: '{{value}} years of experience',
        projectLogoSuffix: 'logo',
      },
    },
  },
  ru: {
    common: {
      add: 'Добавить',
      cancel: 'Отмена',
      create: 'Создать',
      import: 'Импорт',
      exportJson: 'Экспорт JSON',
      importJson: 'Импорт JSON',
      remove: 'Удалить',
      save: 'Сохранить',
      reset: 'Сбросить',
      current: 'Текущая',
      base: 'Основа',
      export: 'Экспорт',
      close: 'Закрыть',
      open: 'Открыть',
    },
    workspace: {
      title: 'Мультиязычное CV',
      subtitle: 'Каждая вкладка — отдельное локализованное CV. Статические подписи переключаются автоматически, а ваш контент копируется из выбранной базовой версии.',
      createAnotherLanguage: 'Другой язык',
      chooseLanguage: 'Язык',
      chooseBase: 'Взять за основу',
      createVersion: 'Создать версию',
      createdFromScratch: 'Создано с нуля',
      deleteConfirm: 'Удалить версию {{language}}? Это действие нельзя отменить.',
      deleteVersion: 'Удалить версию',
      emptyBase: 'Начать с нуля',
      exportJson: 'Экспорт JSON',
      importJson: 'Импорт JSON',
      importInvalid: 'Выбранный файл не содержит корректный workspace CV.',
      importReplaceConfirm: 'Заменить текущий workspace данными из JSON-файла?',
      lastVersionLocked: 'Должна остаться хотя бы одна версия.',
      openVersion: 'Открыть версию',
      originalBadge: 'Оригинал',
      basedOn: 'Основа: {{language}}',
      createdFrom: 'Создано из {{language}}',
      helper: 'Создайте новую языковую версию на основе любой существующей вкладки CV.',
    },
    export: {
      single: 'Экспорт PDF',
      multiple: 'Экспорт всех CV',
      singleLoading: 'Генерируем PDF...',
      multipleLoading: 'Собираем архив...',
      error: 'Не удалось выполнить экспорт.',
      archiveSuffix: 'cv-bundle',
    },
    editor: {
      title: 'Редактор CV',
      resetCurrent: 'Сбросить текущую версию',
      resetCurrentConfirm: 'Сбросить текущую версию? Это действие нельзя отменить.',
    },
    personalInfo: {
      title: 'Личная информация',
      noPhoto: 'Нет фото',
      uploadPhoto: 'Загрузить фото',
      removePhoto: 'Удалить фото',
      cropPhoto: 'Кадрировать фото',
      zoom: 'Масштаб',
      shape: 'Форма',
      round: 'Круглая',
      square: 'Квадратная',
      fullName: 'Полное имя',
      jobTitle: 'Должность',
      email: 'Email',
      phone: 'Телефон',
      whatsapp: 'WhatsApp',
      telegram: 'Telegram',
      github: 'GitHub',
      linkedin: 'LinkedIn',
      age: 'Возраст',
      location: 'Локация',
      summary: 'О себе',
      experienceYears: 'Опыт работы',
      doNotShow: 'Не показывать',
      calculateFromExperience: 'Посчитать по опыту',
      enterManually: 'Указать вручную',
      manualExperienceYears: 'Опыт вручную',
      placeholders: {
        fullName: 'Иван Иванов',
        jobTitle: 'Frontend Developer',
        email: 'ivan@example.com',
        phone: '+7 999 123 45 67',
        telegram: '@username',
        github: 'github.com/username',
        linkedin: 'linkedin.com/in/username',
        age: '25',
        location: 'Москва, Россия',
        summary: 'Кратко расскажите о себе...',
        manualExperienceYears: '5',
      },
      validation: {
        nameMin: 'Имя должно содержать минимум 2 символа',
        jobTitleMin: 'Должность должна содержать минимум 2 символа',
        invalidEmail: 'Некорректный email',
      },
    },
    experience: {
      title: 'Опыт работы',
      companyLogo: 'Логотип компании',
      uploadLogo: 'Загрузить логотип',
      removeLogo: 'Удалить логотип',
      company: 'Компания',
      position: 'Должность',
      startDate: 'Дата начала',
      endDate: 'Дата окончания',
      description: 'Описание',
      empty: 'Опыт работы пока не добавлен.',
      placeholders: {
        company: 'Tech Inc.',
        position: 'Senior Developer',
        description: 'Опишите обязанности и достижения...',
      },
    },
    projects: {
      title: 'Open Source проекты',
      projectLogo: 'Логотип проекта',
      uploadLogo: 'Загрузить логотип',
      removeLogo: 'Удалить логотип',
      projectLink: 'Ссылка на проект',
      shortDescription: 'Короткое описание',
      empty: 'Open Source проекты пока не добавлены.',
      placeholders: {
        link: 'https://github.com/username/project',
        description: 'Кратко опишите проект, стек или ваш вклад...',
      },
    },
    education: {
      title: 'Образование',
      institutionLogo: 'Логотип учебного заведения',
      uploadLogo: 'Загрузить логотип',
      removeLogo: 'Удалить логотип',
      institution: 'Учебное заведение',
      degree: 'Степень / специальность',
      startDate: 'Дата начала',
      endDate: 'Дата окончания',
      description: 'Описание',
      empty: 'Образование пока не добавлено.',
      placeholders: {
        institution: 'Название университета',
        degree: 'Бакалавр компьютерных наук',
        description: 'Опишите обучение, достижения или награды...',
      },
    },
    languages: {
      title: 'Языки',
      namePlaceholder: 'например, English',
      levelPlaceholder: 'Выберите уровень',
      levels: {
        a1: 'A1 - Начальный',
        a2: 'A2 - Базовый',
        b1: 'B1 - Средний',
        b2: 'B2 - Выше среднего',
        c1: 'C1 - Продвинутый',
        c2: 'C2 - Профессиональный',
        native: 'Родной',
      },
    },
    skills: {
      title: 'Навыки',
      placeholder: 'например, React, TypeScript, Node.js',
      defaultGroup: 'Основная группа',
      createGroupPlaceholder: 'Название новой группы',
      groupPlaceholder: 'Название группы',
      addGroup: 'Добавить группу',
      deleteGroup: 'Удалить группу',
      dragHint: 'Перетаскивайте навыки между группами, чтобы менять порядок.',
    },
    dateInput: {
      month: 'Месяц',
      monthOptional: 'Месяц (необязательно)',
      year: 'Год',
      months: {
        '01': 'Январь',
        '02': 'Февраль',
        '03': 'Март',
        '04': 'Апрель',
        '05': 'Май',
        '06': 'Июнь',
        '07': 'Июль',
        '08': 'Август',
        '09': 'Сентябрь',
        '10': 'Октябрь',
        '11': 'Ноябрь',
        '12': 'Декабрь',
      },
    },
    richText: {
      placeholder: 'Введите текст...',
      keyboardShortcuts: 'Горячие клавиши',
      removeFormattingHint: 'Нажмите ещё раз, чтобы снять форматирование',
      linkPrompt: 'Ссылка:',
      preview: 'Предпросмотр',
      markdown: 'Markdown',
      visual: 'Визуальный',
      modeShortMarkdown: 'MD',
      modeShortVisual: 'Визуал',
      toggleModeTitle: 'Переключить режим (Ctrl+M) - текущий: {{mode}}',
      actions: {
        bold: 'Жирный',
        italic: 'Курсив',
        underline: 'Подчёркивание',
        strikethrough: 'Зачёркивание',
        inlineCode: 'Встроенный код',
        heading2: 'Заголовок H2',
        heading3: 'Заголовок H3',
        bulletList: 'Маркированный список',
        numberedList: 'Нумерованный список',
        taskList: 'Список задач',
        blockquote: 'Цитата',
        horizontalRule: 'Разделитель',
        link: 'Ссылка',
      },
    },
    preview: {
      placeholders: {
        profilePhotoAlt: 'Фото профиля',
        fullName: 'Ваше имя',
        jobTitle: 'Должность',
        company: 'Название компании',
        companyLogo: 'Логотип компании',
        position: 'Должность',
        institution: 'Название учебного заведения',
        institutionLogo: 'Логотип учебного заведения',
        degree: 'Степень',
        projectLogo: 'Логотип проекта',
        projectLink: 'Ссылка на проект',
      },
      sections: {
        summary: 'Профессиональный профиль',
        experience: 'Опыт работы',
        projects: 'Open Source проекты',
        education: 'Образование',
        languages: 'Языки',
        skills: 'Навыки',
      },
      labels: {
        start: 'Начало',
        present: 'По настоящее время',
        age: '{{value}} лет',
        lessThanOneYear: 'Меньше 1 года опыта',
        yearOfExperience_one: '{{value}} год опыта',
        yearOfExperience_few: '{{value}} года опыта',
        yearOfExperience_many: '{{value}} лет опыта',
        projectLogoSuffix: 'логотип',
      },
    },
  },
}

const I18nContext = createContext<TranslationContextValue>({
  locale: 'en',
  t: (key) => key,
})

function isTranslationNode(value: TranslationLeaf | TranslationNode | undefined): value is TranslationNode {
  return Boolean(value) && typeof value === 'object'
}

function readTranslation(locale: LocaleCode, key: string): string {
  const segments = key.split('.')
  let current: TranslationLeaf | TranslationNode | undefined = translations[locale]

  for (const segment of segments) {
    if (!isTranslationNode(current)) {
      return key
    }

    current = current[segment]
  }

  return typeof current === 'string' ? current : key
}

function interpolate(template: string, variables?: Record<string, string | number>): string {
  if (!variables) {
    return template
  }

  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(variables[key] ?? ''))
}

export function translate(locale: LocaleCode, key: string, variables?: Record<string, string | number>): string {
  const localeTranslation = readTranslation(locale, key)
  const fallbackTranslation = locale === 'en' ? localeTranslation : readTranslation('en', key)
  const template = localeTranslation === key ? fallbackTranslation : localeTranslation

  return interpolate(template, variables)
}

export function getLocaleOption(locale: LocaleCode): LocaleOption {
  return localeOptions.find((option) => option.code === locale) ?? localeOptions[0]
}

export function getIntlLocale(locale: LocaleCode): string {
  return getLocaleOption(locale).bcp47
}

export function getLocaleLabel(locale: LocaleCode, useNativeLabel = true): string {
  const option = getLocaleOption(locale)
  return useNativeLabel ? option.nativeLabel : option.label
}

export function getSupportedLocales(): LocaleCode[] {
  return localeOptions.map((option) => option.code)
}

export function formatPreviewExperience(locale: LocaleCode, yearsValue: string | number): string {
  const numericValue = typeof yearsValue === 'number' ? yearsValue : Number(yearsValue)
  const displayValue = String(yearsValue)

  if (locale === 'ru') {
    const integerValue = Number.isFinite(numericValue) ? Math.abs(Math.trunc(numericValue)) : null

    if (integerValue === null) {
      return `${displayValue} ${translate(locale, 'preview.labels.yearOfExperience_many', { value: '' }).trim()}`
    }

    const mod10 = integerValue % 10
    const mod100 = integerValue % 100
    const suffixKey = mod10 === 1 && mod100 !== 11
      ? 'preview.labels.yearOfExperience_one'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'preview.labels.yearOfExperience_few'
        : 'preview.labels.yearOfExperience_many'

    return translate(locale, suffixKey, { value: displayValue })
  }

  const key = numericValue === 1 ? 'preview.labels.yearOfExperience_one' : 'preview.labels.yearOfExperience_other'
  return translate(locale, key, { value: displayValue })
}

export const I18nProvider = ({
  children,
  locale,
}: {
  children: ReactNode
  locale: LocaleCode
}) => {
  const value = useMemo<TranslationContextValue>(
    () => ({
      locale,
      t: (key, variables) => translate(locale, key, variables),
    }),
    [locale],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): TranslationContextValue {
  return useContext(I18nContext)
}
