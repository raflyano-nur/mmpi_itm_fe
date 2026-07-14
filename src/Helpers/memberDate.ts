const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DB_DATE_PATTERN = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/

export const toInputDate = (value?: string | number | null): string => {
  if (!value) return ''

  const text = String(value).trim()
  if (ISO_DATE_PATTERN.test(text)) return text

  const dbDate = text.match(DB_DATE_PATTERN)
  if (!dbDate) return ''

  const [, day, month, year] = dbDate
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export const toPasswordFromBirthdate = (value?: string | number | null): string => {
  const isoDate = toInputDate(value)
  if (!isoDate) return ''

  const [year, month, day] = isoDate.split('-')
  return `${day}${month}${year}`
}

export const calculateAgeFromBirthdate = (value?: string | number | null): string => {
  const isoDate = toInputDate(value)
  if (!isoDate) return ''

  const [year, month, day] = isoDate.split('-').map(Number)
  const birth = new Date(year, month - 1, day)
  if (
    Number.isNaN(birth.getTime()) ||
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day
  ) {
    return ''
  }

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff = today.getDate() - birth.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1
  }

  return age >= 0 ? String(age) : ''
}

export const normalizeBirthdateDraft = <T extends Record<string, unknown>>(
  member: T,
  birthdateKey: keyof T,
  ageKey: keyof T,
): T => {
  const birthdate = toInputDate(member[birthdateKey] as string | number | null)
  const currentAge = member[ageKey]

  return {
    ...member,
    [birthdateKey]: birthdate,
    [ageKey]: currentAge != null && String(currentAge).trim() ? String(currentAge) : calculateAgeFromBirthdate(birthdate),
  }
}
