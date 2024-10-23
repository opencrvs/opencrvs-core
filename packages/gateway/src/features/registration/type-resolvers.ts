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
type Location = any /* @todo */
export const typeResolvers: GQLResolver = {
  Location: {
    name: (location: Location) => location.name,
    status: (location: Location) => location.status,
    identifier: (location: Location) => location.identifier,
    longitude: (location: Location) => location.position?.longitude,
    latitude: (location: Location) => location.position?.latitude,
    alias: (location: Location) => location.alias,
    description: (location: Location) => location.description,
    partOf: (location: Location) => location.partOf?.reference,
    type: (location: Location) => {
      return (
        (location.type &&
          location.type.coding &&
          location.type.coding[0].code) ||
        null
      )
    },
    address: (location: Location) => location.address,
    hierarchy: (location: Location, _, { dataSources }) => {
      return dataSources.locationsAPI.getHierarchy(location.id)
    }
  }
}
