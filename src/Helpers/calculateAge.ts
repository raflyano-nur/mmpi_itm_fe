import { calculateAgeFromBirthdate } from './memberDate'

export function calculateAge(birthDate: string): string {
  return calculateAgeFromBirthdate(birthDate)
}
