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

/** SQLSTATE for `unique_violation`. */
const UNIQUE_VIOLATION = '23505'

/**
 * Narrows an unknown error to a postgres unique-violation (SQLSTATE 23505).
 * Kysely rethrows the raw `pg` DatabaseError, which carries the SQLSTATE in
 * its `code` property.
 */
export function isUniqueViolation(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: unknown }).code === UNIQUE_VIOLATION
  )
}

/**
 * The name of the constraint a unique violation tripped, taken from the `pg`
 * DatabaseError's `constraint` property. Callers map it to the field they
 * name in the conflict they raise, because a single write can violate any of
 * several constraints and only the name says which one it was.
 *
 * Undefined when the error is not a unique violation, or when the driver
 * reported no constraint name.
 */
export function getViolatedConstraint(error: unknown): string | undefined {
  if (!isUniqueViolation(error)) {
    return undefined
  }

  const { constraint } = error as { constraint?: unknown }

  return typeof constraint === 'string' ? constraint : undefined
}
