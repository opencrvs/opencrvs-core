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
import { z } from 'zod'

export const LocationType = z.enum([
  'ADMIN_STRUCTURE',
  'CRVS_OFFICE',
  'HEALTH_FACILITY'
])

export type LocationType = z.infer<typeof LocationType>

export const Location = z.object({
  id: UUID,
  name: z.string(),
  parentId: UUID.nullable(),
  validUntil: z.string().datetime().nullable(),
  locationType: LocationType.nullable()
})

export type Location = z.infer<typeof Location>
