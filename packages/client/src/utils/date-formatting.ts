/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
import format from 'date-fns/format'
import formatDistanceToNowStrict from 'date-fns/formatDistanceToNowStrict'
import enGB from 'date-fns/locale/en-GB'
import bn from 'date-fns/locale/bn'
import fr from 'date-fns/locale/fr'
import subYears from 'date-fns/subYears'
import isValid from 'date-fns/isValid'

/*
 *  The actual type is `${number}-${number}-${number}`
 *  but as Date constructor is way too permissive so
 *  using a custom type to restrict PlainDate's direct usage
 *  with Date
 *  It's of format YYYY-MM-DD
 */
export type PlainDate = { __type: 'PlainDate' }

export const locales: Record<string, Locale> = { en: enGB, bn, fr }

/*
 * useful when dealing with draft data
 */
export function isValidPlainDate(rawDate: unknown): rawDate is PlainDate {
  if (typeof rawDate !== 'string') {
    return false
  }
  const [yyyy, mm, dd] = rawDate.split('-')
  if (
    !dd ||
    !mm ||
    !yyyy ||
    dd.length === 0 ||
    mm.length === 0 ||
    yyyy.length < 4 ||
    !isValid(new Date(rawDate))
  ) {
    return false
  }
  return true
}

export function plainDateToLocalDate(plainDate: PlainDate) {
  const rawDate = plainDate as unknown as `${number}-${number}-${number}`
  const [yyyy, mm, dd] = rawDate.split('-')
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd))
}

export function formatPlainDate(
  plainDate: PlainDate,
  formatString = 'dd MMMM yyyy'
) {
  const localDate = plainDateToLocalDate(plainDate)
  return format(localDate, formatString, {
    locale: locales[window.__localeId__]
  })
}

export const formatLongDate = (
  date: string,
  locale = 'en',
  formatString = 'dd MMMM yyyy'
) => {
  const [yyyy, mm, dd] = date.split('-')
  if (
    !dd ||
    !mm ||
    !yyyy ||
    dd.length === 0 ||
    mm.length === 0 ||
    yyyy.length < 4
  ) {
    return ''
  }

  if (!isValid(new Date(date))) {
    return ''
  }
  window.__localeId__ = locale
  return format(new Date(date), formatString, {
    locale: locales[window.__localeId__]
  })
}

export const formattedDuration = (fromDate: Date | number) => {
  if (!isValid(fromDate)) {
    return ''
  }
  return formatDistanceToNowStrict(fromDate, {
    locale: locales[window.__localeId__],
    addSuffix: true,
    roundingMethod: 'floor'
  })
}

export const convertAgeToDate = (age: string): string => {
  return format(subYears(new Date(), Number(age)), 'yyyy-MM-dd')
}

export default function formatDate(date: Date | number, formatStr = 'PP') {
  if (!isValid(date)) {
    return ''
  }
  return format(date, formatStr, {
    locale: locales[window.__localeId__]
  })
}
