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
import {
  NO_WRITE_ATTEMPTED,
  REMEDY,
  SeedSubject,
  renderSubject
} from './seed-report'

export const CREATING_INITIAL_USERS =
  'Seeding failed while creating initial users.'

export const AFTER_WRITING_BEGAN = 'Seeding failed after writing had begun.'

export interface SeedFailure {
  headline: string
  /**
   * Absent when the failure is about nothing an operator can name — a dropped
   * connection, the post-seed trigger. Naming a subject there would invent one.
   */
  subject?: SeedSubject
  reason: string
}

function renderReport(headline: string, details: string[], closing: string) {
  return [
    headline,
    '',
    ...details.map((detail) => `  ${detail}`),
    '',
    closing
  ].join('\n')
}

export function formatSeedFailure({
  headline,
  subject,
  reason
}: SeedFailure): string {
  const detail =
    subject === undefined ? reason : `${renderSubject(subject)}${reason}`

  return renderReport(headline, [detail], REMEDY)
}

export function formatUnwrittenFailure(reason: string): string {
  return `${reason}\n${NO_WRITE_ATTEMPTED}`
}

export function describeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || error.name
  }

  return String(error)
}

/** The user create route reports a duplicate as a bare code, opaque to a
 * person reading a terminal; these map it back to the field it is about. */
const DUPLICATE_FIELDS: Record<string, 'email' | 'mobile'> = {
  DUPLICATE_EMAIL: 'email',
  DUPLICATE_MOBILE: 'mobile'
}

export function describeInitialUserFailure(
  error: unknown,
  user: { email?: string; mobile?: string }
): string {
  const message = describeError(error)
  const field = DUPLICATE_FIELDS[message]

  if (!field) {
    return message
  }

  const value = user[field]

  return value === undefined
    ? `${message} — ${field} is already in use`
    : `${message} — ${field} "${value}" is already in use`
}

export class PartialSeedError extends Error {
  constructor(report: string) {
    super(report)
    this.name = 'PartialSeedError'
  }
}
