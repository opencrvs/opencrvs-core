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

import { GQLResolver } from '@gateway/graphql/schema'
import { fetchAllLocations } from '@gateway/location'
import { UUID } from '@opencrvs/commons'

export const resolvers: GQLResolver = {
  Query: {
    async isLeafLevelLocation(_, { locationId }, { headers: authHeader }) {
      const allAdminLocations = await fetchAllLocations(authHeader)

      /*
       * The country has no location record in the database, so '0' is used
       * as a virtual ID to represent it. Top-level administrative areas
       * (direct children of the country) have no parent admin area, which
       * is represented as administrativeAreaId === null.
       */
      const administrativeChildLocation = allAdminLocations.filter((child) =>
        locationId === '0'
          ? child.administrativeAreaId === null
          : child.administrativeAreaId === (locationId as UUID)
      )

      return administrativeChildLocation.length === 0
    }
  }
}
