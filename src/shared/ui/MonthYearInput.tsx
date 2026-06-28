import { useEffect, useState } from 'react'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'

interface MonthYearInputProps {
  value?: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
] as const

function parseMonthYear(value?: string) {
  const match = value?.match(/^(\d{4})-(\d{2})$/)

  if (!match) {
    return { year: '', month: '' }
  }

  return {
    year: match[1],
    month: match[2],
  }
}

export const MonthYearInput = ({ value = '', onChange, className, disabled }: MonthYearInputProps) => {
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
        aria-label="Month"
        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="">Month</option>
        {MONTH_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Input
        value={year}
        onChange={(e) => handleYearChange(e.target.value)}
        placeholder="Year"
        inputMode="numeric"
        maxLength={4}
        disabled={disabled}
        aria-label="Year"
      />
    </div>
  )
}

