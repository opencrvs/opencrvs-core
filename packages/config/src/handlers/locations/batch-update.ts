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

import { fetchLocations, sendToFhir } from '@config/services/hearth'
import * as Hapi from '@hapi/hapi'
import {
  findStatisticalId,
  Location,
  resourceIdentifierToUUID,
  SavedLocation,
  TransactionResponse
} from '@opencrvs/commons/types'
import {
  locationRequestSchema,
  locationStatisticSchema,
  Status,
  LocationStatistic
} from './handler'
import * as Joi from 'joi'
import { cloneDeep, compact, isEqual } from 'lodash'

type UpdateLocation = {
  statisticalID: string
  name?: string
  alias?: string
  partOf?: string
  status?: string
  statistics?: LocationStatistic
}

const batchUpdateSchema = Joi.object({
  statisticalID: Joi.string().required(),
  name: Joi.string().optional(),
  alias: Joi.string().optional(),
  partOf: Joi.string().optional(),
  status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE).optional(),
  statistics: locationStatisticSchema.optional()
}).label('BatchUpdateLocationPayload')

export const batchUpsertSchema = Joi.array().items(
  locationRequestSchema,
  batchUpdateSchema
)

const batchUpdateLocation = async (
  locations: Location[],
  { authHeader }: { authHeader: string }
) => {
  const bundle = {
    resourceType: 'Bundle',
    type: 'batch',
    entry: locations.map((location) => ({
      resource: location,
      request: {
        method: 'PUT',
        url: `Location/${location.id}`
      }
    }))
  }

  const response = await sendToFhir(bundle, {
    method: 'POST',
    token: authHeader
  })
  return (await response.json()) as TransactionResponse
}

const payloadToFhirLocation = (
  newLocation: UpdateLocation,
  savedLocations: SavedLocation[]
) => {
  const savedLocationsMap = new Map(
    savedLocations.map((location) => [findStatisticalId(location)!, location])
  )

  const referencePartOf =
    newLocation.partOf &&
    savedLocationsMap.get(newLocation.partOf)?.partOf?.reference
  const uuidPartOf =
    referencePartOf && resourceIdentifierToUUID(referencePartOf)

  const savedLocation = savedLocationsMap.get(newLocation.statisticalID)
  const originalLocation = cloneDeep(savedLocation)

  if (!savedLocation) {
    throw new Error(
      `The location ${newLocation.statisticalID} doesn't exist. Please use the POST endpoint to create new locations.`
    )
  }

  if (newLocation.name) {
    savedLocation.name = newLocation.name
  }
  if (newLocation.alias) {
    savedLocation.alias = [newLocation.alias]
  }
  if (uuidPartOf) {
    savedLocation.partOf = { reference: `Location/${uuidPartOf}` }
  }

  return isEqual(savedLocation, originalLocation) ? null : savedLocation
}

export async function batchUpdateLocationHandler(
  request: Hapi.Request,
  _h: Hapi.ResponseToolkit
) {
  const newLocations = request.payload as Array<UpdateLocation>
  const savedLocations = await fetchLocations()

  const updatedLocations = newLocations.map((newLocation) =>
    payloadToFhirLocation(newLocation, savedLocations)
  )

  return batchUpdateLocation(compact(updatedLocations), {
    authHeader: request.headers.authorization
  })
}
