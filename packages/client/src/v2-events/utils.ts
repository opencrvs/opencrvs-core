import { ResolvedUser } from '@opencrvs/commons'

/**
 *  Human readable date format for full date and time (e.g. January 09, 2025 · 01.24 PM)
 */
export const HUMAN_READABLE_FULL_DATE_TIME = 'MMMM dd, yyyy · hh.mm a'

/**
 *
 * Joins defined values using a separator and trims the result
 */
export function joinValues(
  values: Array<string | undefined | null>,
  separator = ' '
) {
  return values
    .filter((value) => !!value)
    .join(separator)
    .trim()
}

export function getUsersFullName(
  names: ResolvedUser['name'],
  language: string
) {
  const match = names.find((name) => name.use === language) ?? names[0]

  return joinValues([...match.given, match.family])
}
