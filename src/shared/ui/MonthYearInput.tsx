import { useEffect, useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'
import { useI18n } from '@/shared/i18n'

interface MonthYearInputProps {
  value?: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
  monthOptional?: boolean
}

const MONTH_OPTIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const

function parseMonthYear(value?: string) {
  const yearOnlyMatch = value?.match(/^(\d{4})$/)

  if (yearOnlyMatch) {
    return { year: yearOnlyMatch[1], month: '' }
  }

  const match = value?.match(/^(\d{4})-(\d{2})$/)

  if (!match) {
    return { year: '', month: '' }
  }

  return {
    year: match[1],
    month: match[2],
  }
}

export const MonthYearInput = ({
  value = '',
  onChange,
  className,
  disabled,
  monthOptional = false,
}: MonthYearInputProps) => {
  const { t } = useI18n()
  const parsedValue = parseMonthYear(value)
  const [month, setMonth] = useState(parsedValue.month)
  const [year, setYear] = useState(parsedValue.year)

  useEffect(() => {
    const nextValue = parseMonthYear(value)
    setMonth(nextValue.month)
    setYear(nextValue.year)
  }, [value])

  const emitChange = (nextMonth: string, nextYear: string) => {
    const normalizedYear = nextYear.replace(/\D/g, '').slice(0, 4)

    if (!nextMonth && !normalizedYear) {
      onChange('')
      return
    }

    if (monthOptional && normalizedYear.length === 4 && !nextMonth) {
      onChange(normalizedYear)
      return
    }

    if (nextMonth && normalizedYear.length === 4) {
      onChange(`${normalizedYear}-${nextMonth}`)
      return
    }

    onChange('')
  }

  const handleMonthChange = (nextMonth: string) => {
    setMonth(nextMonth)
    emitChange(nextMonth, year)
  }

  const handleYearChange = (nextYear: string) => {
    const normalizedYear = nextYear.replace(/\D/g, '').slice(0, 4)
    setYear(normalizedYear)
    emitChange(month, normalizedYear)
  }

  return (
    <div className={cn('grid grid-cols-[minmax(0,1.65fr)_minmax(72px,0.85fr)] gap-2', className)}>
      <select
        value={month}
        onChange={(e) => handleMonthChange(e.target.value)}
        disabled={disabled}
        aria-label={t('dateInput.month')}
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">{monthOptional ? t('dateInput.monthOptional') : t('dateInput.month')}</option>
        {MONTH_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(`dateInput.months.${option}`)}
          </option>
        ))}
      </select>
      <Input
        value={year}
        onChange={(e) => handleYearChange(e.target.value)}
        placeholder={t('dateInput.year')}
        inputMode="numeric"
        maxLength={4}
        disabled={disabled}
        aria-label={t('dateInput.year')}
      />
    </div>
  )
}
