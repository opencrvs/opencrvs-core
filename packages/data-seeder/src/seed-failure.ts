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

/**
 * Failure reports, in the two kinds this job distinguishes: before the first
 * write the database is untouched and the report names no remedy; after
 * writing has begun re-running collides on an external-id unique constraint
 * rather than resuming, so the report says to clear the database. The remedy
 * names no command — one would be wrong for two of the three ways this runs.
 */

interface FailedRecord {
  position: number
  username: string
}

export interface InitialUserFailure {
  record: FailedRecord
  reason: string
  created: number
  total: number
}

const REMEDY =
  'The database now holds incomplete seed-data. ' +
  'Clear the database before you seed again.'

const NOTHING_WAS_SEEDED = 'No write was attempted; nothing was seeded.'

function renderReport(headline: string, details: string[], closing: string) {
  return [
    headline,
    '',
    ...details.map((detail) => `  ${detail}`),
    '',
    closing
  ].join('\n')
}

export function formatInitialUserFailure({
  record,
  reason,
  created,
  total
}: InitialUserFailure): string {
  const counted =
    total === 1
      ? `${created} of 1 initial user was created before this failure`
      : `${created} of ${total} initial users were created before this failure`

  return renderReport(
    'Seeding failed while creating initial users.',
    [`record ${record.position} (${record.username}): ${reason}`, counted],
    REMEDY
  )
}

export function formatPartialSeedFailure(reason: string): string {
  return renderReport(
    'Seeding failed after writing had begun.',
    [reason],
    REMEDY
  )
}

export function formatUnwrittenFailure(reason: string): string {
  return `${reason}\n${NOTHING_WAS_SEEDED}`
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

/** The type is the phase marker: only the writing part of the entry point
 * raises it, so an error reaching the top-level handler without it came from
 * before the first write. */
export class PartialSeedError extends Error {
  public readonly report: string

  constructor(report: string) {
    super(report)
    this.name = 'PartialSeedError'
    this.report = report
  }
}
