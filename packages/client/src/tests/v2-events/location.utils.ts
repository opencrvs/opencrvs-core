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
import { Location, UUID } from '@opencrvs/commons/client'

/** A location that was active, then inactivated via the Location QA tool. */
export function buildInactiveLocation({
  id,
  name,
  locationType,
  administrativeAreaId,
  inactiveFrom = '2020-01-01'
}: {
  id: UUID
  name: string
  locationType: string
  administrativeAreaId: UUID
  inactiveFrom?: string
}): Location {
  return {
    id,
    name,
    locationType,
    administrativeAreaId,
    externalId: null,
    status: 'inactive',
    versions: [
      {
        versionId: id,
        effectiveFrom: '0001-01-01',
        name,
        externalId: null,
        status: 'active'
      },
      {
        versionId: id,
        effectiveFrom: inactiveFrom,
        name,
        externalId: null,
        status: 'inactive'
      }
    ]
  }
}
