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
 * Development-only knobs for generating a large synthetic administrative
 * hierarchy, so the location-versioning paths can be exercised at realistic
 * scale. Read by the `triggers/system/ready` handler during `seed:dev`.
 *
 * Deliberately hardcoded rather than environment-driven: this is dev tooling,
 * and editing the file is what restarts the service under nodemon anyway.
 *
 * **Keep `ENABLED` false in committed code** — with it on, every `seed:dev` in
 * the repo generates `totalLocations` rows.
 *
 * `avgHistory` must be between 1 and `maxHistory`; a contradiction throws on the
 * first request rather than being validated up front.
 */
export const SYNTHETIC: {
  ENABLED: boolean
  adminAreasPerLevel: number[]
  totalLocations: number
  avgHistory: number
  maxHistory: number
  seed: number
  superUserPassword: string
} = {
  ENABLED: true,

  /** Administrative areas per level, shallowest first. Length is the depth. */
  adminAreasPerLevel: [5, 5000, 10000, 30000],

  /** Generated locations, on top of those in locations.csv. */
  totalLocations: 100000,

  /** Mean elements per generated versions array. Achieved exactly. */
  avgHistory: 2,

  /** Hard cap on elements in a generated versions array. */
  maxHistory: 10,

  /** Same seed and same run date produce identical output. */
  seed: 42,

  /**
   * Used only to re-mint the initialisation token when a run outlives the one
   * `data-seeder` forwarded (600s by default). Matches the hardcoded dev
   * credentials in `events/adoption/sealing-service.ts`.
   */
  superUserPassword: 'password'
}
