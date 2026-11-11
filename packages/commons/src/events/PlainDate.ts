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
import { z } from 'zod'

/**
 * A branded YYYY-MM-DD date string that must be converted to a JS Date via
 * {@link plainDateToLocalDate} rather than `new Date()`.
 *
 * `new Date("2021-01-01")` treats the string as UTC midnight, which shifts the
 * displayed day in timezones behind UTC. Use `plainDateToLocalDate` instead to
 * get local midnight.
 */
export const PlainDate = z
  .string()
  .date()
  .brand('PlainDate')
  .describe('Date in the format YYYY-MM-DD')
export type PlainDate = z.infer<typeof PlainDate>

export const isPlainDate = (date: unknown): date is PlainDate =>
  PlainDate.validate(date)

/**
 * Extracts the plain calendar date from an ISO 8601 datetime (or passes an
 * already-plain YYYY-MM-DD through) as a {@link PlainDate}. This is the single
 * conversion from a timestamp to a location-resolution anchor — comparing
 * plain dates as strings, with no timezone conversion. Assumes a valid ISO /
 * YYYY-MM-DD input, as produced by the event metadata and date fields.
 */
export function toPlainDate(dateTime: string): PlainDate {
  return dateTime.split('T')[0] as PlainDate
}

/**
 * Creating an `Intl.DateTimeFormat` is expensive, and dates are resolved on hot paths
 * (every request on the server), so one is kept per time zone.
 */
const dateFormats = new Map<string, Intl.DateTimeFormat>()

function getDateFormat(timeZone: string) {
  let format = dateFormats.get(timeZone)
  if (!format) {
    format = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    dateFormats.set(timeZone, format)
  }
  return format
}

/**
 * The calendar date of `date` in the IANA `timeZone` (e.g. 'Asia/Dhaka'), as a
 * {@link PlainDate}. Unlike {@link toPlainDate}, which reads the UTC date.
 */
export function toPlainDateInTimeZone(date: Date, timeZone: string): PlainDate {
  const parts = Object.fromEntries(
    getDateFormat(timeZone)
      .formatToParts(date)
      .map(({ type, value }) => [type, value])
  )
  return `${parts.year}-${parts.month}-${parts.day}` as PlainDate
}

/**
 * Converts a {@link PlainDate} (YYYY-MM-DD) to a local `Date` at midnight.
 *
 * The `Date(year, month, day)` constructor uses the local timezone, unlike
 * `new Date(dateString)` which interprets bare date strings as UTC midnight.
 */
export function plainDateToLocalDate(date: PlainDate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}
