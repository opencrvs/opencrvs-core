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
  AdministrativeArea,
  Location,
  UUID,
  EventIndexWithAdministrativeHierarchy,
  EventIndex,
  getLocationHierarchy
} from '@opencrvs/commons/client'

/**
 * Converts an `EventIndex` into an `EventIndexWithAdministrativeHierarchy`
 * by expanding each location UUID field into a root-first array of UUIDs
 * representing the full administrative hierarchy.
 *
 * The following fields are expanded:
 * - `createdAtLocation`
 * - `updatedAtLocation`
 * - `placeOfEvent`
 * - `legalStatuses.DECLARED.createdAtLocation`
 * - `legalStatuses.REGISTERED.createdAtLocation`
 */
export function buildEventIndexWithHierarchy(
  event: EventIndex,
  context: {
    administrativeAreas: Map<UUID, AdministrativeArea>
    locations: Map<UUID, Location>
  }
): EventIndexWithAdministrativeHierarchy {
  const resolve = (id: UUID | null | undefined) =>
    id ? getLocationHierarchy(id, context) : undefined

  return {
    ...event,
    createdAtLocation: resolve(event.createdAtLocation) ?? [],
    updatedAtLocation: resolve(event.updatedAtLocation) ?? [],
    placeOfEvent: resolve(event.placeOfEvent),
    legalStatuses: {
      DECLARED: event.legalStatuses.DECLARED
        ? {
            ...event.legalStatuses.DECLARED,
            createdAtLocation:
              resolve(event.legalStatuses.DECLARED.createdAtLocation) ?? []
          }
        : undefined,
      REGISTERED: event.legalStatuses.REGISTERED
        ? {
            ...event.legalStatuses.REGISTERED,
            createdAtLocation:
              resolve(event.legalStatuses.REGISTERED.createdAtLocation) ?? []
          }
        : undefined
    }
  }
}
