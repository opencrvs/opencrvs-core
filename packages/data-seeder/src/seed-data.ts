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
  ApplicationConfigProblem,
  ApplicationConfigRead
} from './application-config'
import { LocationProblem, LocationRead } from './locations'
import { RoleProblem, RoleRead } from './roles'
import { InitialUserRef } from './seed-report'
import { UserProblem, UserRead } from './users'

/** Every part of the seed-data, as the module that owns it read it. */
export interface SeedSources {
  users: UserRead
  roles: RoleRead
  locations: LocationRead
  applicationConfig: ApplicationConfigRead
}

export type CrossCuttingProblem =
  | {
      kind: 'unknownOffice'
      user: InitialUserRef
      primaryOfficeId: string
      /** What the reference resolves to, which is what is not declared. */
      externalId: string
    }
  | { kind: 'unknownRole'; user: InitialUserRef; role: string }
  | {
      kind: 'mobileDoesNotMatchPattern'
      user: InitialUserRef
      mobile: string
      pattern: string
    }
  | { kind: 'noConfigurationAdministrator'; scope: string }

/** Everything that can be wrong with a set of seed-data. */
export type SeedProblem =
  | UserProblem
  | RoleProblem
  | LocationProblem
  | ApplicationConfigProblem
  | CrossCuttingProblem
