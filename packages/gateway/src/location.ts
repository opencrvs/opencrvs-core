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

import { IAuthHeader, UUID } from '@opencrvs/commons'
import { api } from '@gateway/v2-events/events/service'

export const fetchLocation = async (id: UUID, authHeader: IAuthHeader) => {
  return api.locations.get.query({ id }, { context: { headers: authHeader } })
}

export const fetchAllLocations = async (authHeader: IAuthHeader) => {
  return api.locations.list.query(
    { locationType: 'ADMIN_STRUCTURE' },
    { context: { headers: authHeader } }
  )
}

export const fetchLocationHierarchy = async (
  id: UUID,
  authHeader: IAuthHeader
) => {
  return api.locations.getLocationHierarchy.query(
    { locationId: id },
    { context: { headers: authHeader } }
  )
}
