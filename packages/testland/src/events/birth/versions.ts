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
import { INITIAL_EVENT_CONFIG_VERSION_ID } from '@opencrvs/toolkit/events'

/**
 * The versions of the birth event. Testland has two of them, so that QA can test
 * form versioning (#7463) against records of a version that is no longer current.
 *
 * - `initial` is the form that was in use before 1 September 2026. It keeps the
 *   id of the version that every record created before versioning is stamped with.
 * - `v2` is the current form, in effect from 1 September 2026.
 */
export const BirthVersion = {
  INITIAL: INITIAL_EVENT_CONFIG_VERSION_ID,
  V2: 'v2'
} as const

export type BirthVersion = (typeof BirthVersion)[keyof typeof BirthVersion]

/** The date from which version `v2` is in effect. */
export const BIRTH_V2_EFFECTIVE_FROM = '2026-09-01'
