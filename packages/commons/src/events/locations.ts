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

import { UUID } from '../uuid'
import * as z from 'zod/v4'

/** @deprecated */
export const LocationTypeV1 = z.enum([
  'ADMIN_STRUCTURE',
  'CRVS_OFFICE',
  'HEALTH_FACILITY'
])
export type LocationTypeV1 = z.infer<typeof LocationTypeV1>

export const LocationType = z.enum(['CRVS_OFFICE', 'HEALTH_FACILITY'])

export type LocationType = z.infer<typeof LocationType>

export const AdministrativeArea = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  parentId: UUID.nullable(),
  validUntil: z.iso.datetime().nullable()
})

export type AdministrativeArea = z.infer<typeof AdministrativeArea>

export const Location = z.object({
  id: UUID,
  name: z.string(),
  externalId: z.string().nullish(),
  administrativeAreaId: UUID.nullable(),
  validUntil: z.iso.datetime().nullable(),
  locationType: z.string().nullable()
})

export type Location = z.infer<typeof Location>
