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

import * as z from 'zod/v4'
import { UUID } from '../uuid'
import { LocationStatus } from './locations'

/**
 * Input payload for creating a location: the identity fields (parent and
 * locationType are set once, immutable thereafter) plus the first version.
 * `id` and `versionId` may be supplied by the caller for idempotent retries.
 * `effectiveFrom` defaults to the beginning-of-time sentinel on the server.
 */
export const CreateLocationPayload = z.object({
  id: UUID.optional(),
  versionId: UUID.optional(),
  name: z.string(),
  externalId: z.string().nullish(),
  administrativeAreaId: UUID.nullable(),
  locationType: z.string().nullable(),
  effectiveFrom: z.iso.date().optional(),
  status: LocationStatus.default('active')
})

export type CreateLocationPayload = z.infer<typeof CreateLocationPayload>

/**
 * Input payload for appending a new version to a location. A full snapshot of
 * every versioned field is required — omitted does not mean unchanged. The
 * schema is strict: identity fields (`administrativeAreaId`, `locationType`)
 * are rejected rather than ignored, as they cannot change. `lastVersionId`
 * is the optimistic-concurrency check: it must be the id of the last element
 * the caller observed. `effectiveFrom` defaults to today on the server;
 * supply it explicitly for idempotent retries.
 */
export const UpdateLocationPayload = z.strictObject({
  id: UUID,
  versionId: UUID.optional(),
  name: z.string(),
  externalId: z.string().nullish(),
  status: LocationStatus,
  effectiveFrom: z.iso.date().optional(),
  lastVersionId: UUID
})

export type UpdateLocationPayload = z.infer<typeof UpdateLocationPayload>

/**
 * Input payload for withdrawing a pending (future-dated) version element.
 * Only elements whose `effectiveFrom` has not yet passed can be withdrawn.
 */
export const WithdrawLocationVersionPayload = z.object({
  id: UUID,
  versionId: UUID
})

export type WithdrawLocationVersionPayload = z.infer<
  typeof WithdrawLocationVersionPayload
>

/**
 * Administrative-area twin of {@link CreateLocationPayload}: `parentId`
 * instead of `administrativeAreaId`, no `locationType`.
 */
export const CreateAdministrativeAreaPayload = z.object({
  id: UUID.optional(),
  versionId: UUID.optional(),
  name: z.string(),
  externalId: z.string().nullish(),
  parentId: UUID.nullable(),
  effectiveFrom: z.iso.date().optional(),
  status: LocationStatus.default('active')
})

export type CreateAdministrativeAreaPayload = z.infer<
  typeof CreateAdministrativeAreaPayload
>

/**
 * Administrative-area twin of {@link UpdateLocationPayload} — strict for the
 * same reason: the identity field (`parentId`) is rejected, not ignored.
 */
export const UpdateAdministrativeAreaPayload = z.strictObject({
  id: UUID,
  versionId: UUID.optional(),
  name: z.string(),
  externalId: z.string().nullish(),
  status: LocationStatus,
  effectiveFrom: z.iso.date().optional(),
  lastVersionId: UUID
})

export type UpdateAdministrativeAreaPayload = z.infer<
  typeof UpdateAdministrativeAreaPayload
>

/**
 * Administrative-area twin of {@link WithdrawLocationVersionPayload}.
 */
export const WithdrawAdministrativeAreaVersionPayload = z.object({
  id: UUID,
  versionId: UUID
})

export type WithdrawAdministrativeAreaVersionPayload = z.infer<
  typeof WithdrawAdministrativeAreaVersionPayload
>
