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
import { EncodedScope } from '@opencrvs/commons'
import { Offending, SeedSubject } from './seed-report'

/** Every field is optional, including those the country config's schema
 * requires: an entry that did not parse still arrives here and may be missing
 * anything, so a check reads only what is there. */
export interface SeedDataUser {
  username?: string
  email?: string
  mobile?: string
  /** A compound reference, not the office's own id. */
  primaryOfficeId?: string
  role?: string
  malformed?: string
}

export interface SeedDataRole {
  id?: string
  scopes: EncodedScope[]
  malformed?: string
}

export interface SeedDataLocation {
  id: string
  name: string
  /** `Location/<id>`, or `Location/0` at the root of the hierarchy. */
  partOf: string
}

export interface SeedData {
  users: SeedDataUser[]
  roles: SeedDataRole[]
  PHONE_NUMBER_PATTERN: string
  userListError?: string
  roleListError?: string
  administrativeAreas: SeedDataLocation[]
  locations: SeedDataLocation[]
}

export type SeedDataProblem = SeedSubject &
  Offending & {
    problem: string
    rule: string
  }
