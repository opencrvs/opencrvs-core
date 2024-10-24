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
  resourceIdentifierToUUID,
  SavedLocation
} from '@opencrvs/commons/types'
import { GQLResolver } from '@gateway/graphql/schema'
import { fetchAllLocations, fetchLocationChildren } from '@gateway/location'
import { UUID } from '@opencrvs/commons'

export const resolvers: GQLResolver = {
  Query: {
    async isLeafLevelLocation(_, { locationId }) {
      let children: SavedLocation[]
      /*
       * This is because of a tech debt we have that
       * there is no location resource created for the
       * country so we have a bunch of places where we
       * need to manually check if the id equals '0'
       */
      if (locationId === '0') {
        children = await fetchAllLocations()
      } else {
        children = await fetchLocationChildren(locationId as UUID)
      }
      /*
       * We want to consider only the admin structure locations
       * here & not the offices or addresses that might have the
       * given location as a parent
       */
      const administrativeChildLocation = children.filter(
        (child) =>
          child.type?.coding?.some(({ code }) => code === 'ADMIN_STRUCTURE') &&
          child.partOf &&
          resourceIdentifierToUUID(child.partOf.reference) === locationId
      )
      return administrativeChildLocation.length == 0
    }
  }
}
