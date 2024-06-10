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

import { fetchFromHearth, sendToFhir } from '@config/services/hearth'
import { badRequest } from '@hapi/boom'
import { updateStatisticalExtensions } from './utils'
import * as Hapi from '@hapi/hapi'
import { LocationStatistic, locationStatisticSchema, Status } from './handler'
import Joi = require('joi')

export const updateSchema = Joi.object({
  name: Joi.string().optional(),
  alias: Joi.string().optional(),
  status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE).optional(),
  statistics: locationStatisticSchema.optional()
}).label('UpdateLocationPayload')

type UpdateLocation = {
  name?: string
  alias?: string
  status?: string
  statistics?: LocationStatistic
}

export async function updateLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const locationId = request.params.locationId
  const location = request.payload as UpdateLocation
  const existingLocation = await fetchFromHearth(`Location?_id=${locationId}`)
  const newLocation = existingLocation.entry[0].resource

  if (existingLocation.total === 0) {
    throw badRequest(`${locationId} is not a valid location`)
  }

  if (location.name) {
    newLocation.name = location.name
  }
  if (location.alias) {
    newLocation.alias = [location.alias]
  }
  if (location.status) {
    newLocation.status = location.status
  }
  if (location.statistics) {
    const statisticalExtensions = updateStatisticalExtensions(
      location.statistics,
      newLocation.extension
    )
    newLocation.extension = statisticalExtensions
  }

  const response = await sendToFhir(
    JSON.stringify(newLocation),
    `/Location/${locationId}`,
    'PUT',
    request.headers.authorization
  ).catch((err) => {
    throw Error('Cannot update location to FHIR')
  })

  return h.response(response.statusText)
}
