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

import { TRPCError } from '@trpc/server'
import {
  resolveEffectiveVersion,
  toPlainDate,
  VersionedEventConfig
} from '@opencrvs/commons'

/** Clock drift tolerated on the client that chose the version. */
const CLOCK_SKEW_MS = 5 * 60 * 1000

/**
 * The version a new record is created under:
 *  - the one the client chose (it may have created the record offline, before a newer version took effect),
 *  - else the one in effect now.
 * @throws {TRPCError}
 *  - HTTP 400 when the client's version is not configured
 *  - HTTP 400 when the client's version takes effect in the future (beyond clock drift)
 *  - HTTP 409 when no version was chosen and none is in effect yet
 */
export function resolveVersionForNewRecord(
  config: VersionedEventConfig,
  configVersionId: string | undefined,
  now: Date
) {
  if (!configVersionId) {
    const version = resolveEffectiveVersion(config, now)
    if (!version) {
      throw new TRPCError({
        code: 'CONFLICT',
        message: `Event '${config.id}' has no version in effect on ${toPlainDate(now.toISOString())}`
      })
    }
    return version
  }

  const version = config.versions.find(({ id }) => id === configVersionId)
  if (!version) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Event '${config.id}' has no version '${configVersionId}'`
    })
  }

  const latestClientDate = toPlainDate(
    new Date(now.getTime() + CLOCK_SKEW_MS).toISOString()
  )
  if (version.effectiveFrom && version.effectiveFrom > latestClientDate) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `Version '${configVersionId}' of event '${config.id}' takes effect on ${version.effectiveFrom}, in the future`
    })
  }

  return version
}
