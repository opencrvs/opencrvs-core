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
 * The vocabulary both operator reports render in: what a problem is about, how
 * an offending field reads, and the two closing sentences.
 *
 * It sits apart from either report because both must agree. Validation runs
 * before the first write and a failure after it, and an operator who sees one
 * and then the other must find the same record identified the same way — so
 * the format is shared code rather than a convention held in two places.
 */

/**
 * A user record's identity in the seed-data. `position` is 1-based and is
 * deliberately not a line number: seed-data arrives as parsed objects over
 * HTTP with no row provenance, and the job cannot know the country config
 * serves users from a file at all.
 */
export interface SeedDataRecord {
  position: number
  /** Absent when the record did not parse; it may be missing anything. */
  username?: string
}

/**
 * What a problem or a failure is about. Open by construction: `subject` is any
 * nameable thing — a location, a role, the application configuration, the
 * initial users taken as a set — so a new kind of subject needs no new
 * variant. The tag is what stops a problem rendering with no subject at all,
 * which would leave an operator a line they cannot place.
 */
export type SeedSubject =
  | { about: 'record'; record: SeedDataRecord }
  | { about: 'subject'; subject: string }

/** The offending field, when the problem is about one. */
export interface Offending {
  field?: string
  value?: string
}

/** Trailing separator included: a subject is always followed by what is wrong
 * with it. */
export function renderSubject(subject: SeedSubject): string {
  if (subject.about === 'subject') {
    return `${subject.subject}: `
  }

  const { record } = subject

  return record.username === undefined
    ? `record ${record.position}: `
    : `record ${record.position} (${record.username}): `
}

export function renderOffending({ field, value }: Offending): string {
  if (field === undefined) {
    return ''
  }

  return value === undefined ? `${field} ` : `${field} "${value}" `
}

/**
 * The two closing sentences, and the whole of what an operator has to act on.
 * One says the database is untouched, the other says go clear it; confusing
 * them sends an operator either to destroy a clean database or to re-run
 * against a dirty one.
 *
 * Neither names a command. The same job runs locally, as a container service
 * and as a deployment job, so any command would be wrong for two of the three.
 */
export const REMEDY =
  'The database now holds incomplete seed-data. ' +
  'Clear the database before you seed again.'

/** The phrase itself, because the two pre-write reports lead into it
 * differently: validation counts the problems it found first, a fetch failure
 * says no write was attempted. */
export const NOTHING_WAS_SEEDED = 'nothing was seeded.'

export const NO_WRITE_ATTEMPTED = `No write was attempted; ${NOTHING_WAS_SEEDED}`
