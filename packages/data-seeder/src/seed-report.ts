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

export interface InitialUserRef {
  position: number
  /** Absent when the entry did not parse; it may be missing anything. */
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
  | { about: 'initialUser'; user: InitialUserRef }
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

  const { user } = subject

  return user.username === undefined
    ? `initial user ${user.position}: `
    : `initial user ${user.position} (${user.username}): `
}

export function renderOffending({ field, value }: Offending): string {
  if (field === undefined) {
    return ''
  }

  return value === undefined ? `${field} ` : `${field} "${value}" `
}

export const REMEDY =
  'The database now holds incomplete seed-data. ' +
  'Clear the database before you seed again.'

export const NOTHING_WAS_SEEDED = 'nothing was seeded.'

export const NO_WRITE_ATTEMPTED = `No write was attempted; ${NOTHING_WAS_SEEDED}`
