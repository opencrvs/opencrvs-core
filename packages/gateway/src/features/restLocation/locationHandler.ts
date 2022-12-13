/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
import { fetchFromHearth, sendToFhir } from '@gateway/features/fhir/utils'
import * as Hapi from '@hapi/hapi'
import { badRequest, conflict } from '@hapi/boom'
import * as Joi from 'joi'
import {
  composeFhirLocation,
  generateStatisticalExtensions,
  getLocationsByIdentifier,
  updateStatisticalExtensions
} from './utils'

enum Code {
  CRVS_OFFICE = 'CRVS_OFFICE',
  ADMIN_STRUCTURE = 'ADMIN_STRUCTURE',
  HEALTH_FACILITY = 'HEALTH_FACILITY'
}

export enum JurisdictionType {
  STATE = 'STATE',
  DISTRICT = 'DISTRICT',
  LOCATION_LEVEL_1 = 'LOCATION_LEVEL_1',
  LOCATION_LEVEL_2 = 'LOCATION_LEVEL_2',
  LOCATION_LEVEL_3 = 'LOCATION_LEVEL_3',
  LOCATION_LEVEL_4 = 'LOCATION_LEVEL_4',
  LOCATION_LEVEL_5 = 'LOCATION_LEVEL_5'
}

enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export enum ExtensionUrl {
  MALE_POPULATION = 'http://opencrvs.org/specs/id/statistics-male-populations',
  FEMALE_POPULATION = 'http://opencrvs.org/specs/id/statistics-female-populations',
  TOTAL_POPULATION = 'http://opencrvs.org/specs/id/statistics-total-populations',
  CRUDE_BIRTH_RATE = 'http://opencrvs.org/specs/id/statistics-crude-birth-rates'
}

export type Statistics = Array<Record<number, number>>

export type LocationStatistic = {
  year: number
  male_population: number
  female_population: number
  population: number
  crude_birth_rate: number
}

export type Location = {
  statisticalID: string
  name: string
  partOf: string
  code: string
  alias?: string
  jurisdictionType: string
  statistics?: LocationStatistic[]
}

export type Facility = {
  statisticalID: string
  name: string
  partOf: string
  code: string
  alias?: string
  jurisdictionType?: string
}

type UpdateLocation = {
  name?: string
  alias?: string
  status?: string
  statistics?: LocationStatistic
}

const locationStatisticSchema = Joi.object({
  year: Joi.number().required(),
  male_population: Joi.number().required(),
  female_population: Joi.number().required(),
  population: Joi.number().required(),
  crude_birth_rate: Joi.number().required()
})

function instanceOfJurisdiction(object: any): object is Location {
  return 'statistics' in object
}

export const requestSchema = Joi.object({
  statisticalID: Joi.string().required(),
  name: Joi.string().required(),
  alias: Joi.string().optional(),
  partOf: Joi.string().required(),
  code: Joi.string()
    .valid(Code.ADMIN_STRUCTURE, Code.CRVS_OFFICE, Code.HEALTH_FACILITY)
    .required(),
  jurisdictionType: Joi.string()
    .valid(
      JurisdictionType.DISTRICT,
      JurisdictionType.STATE,
      JurisdictionType.LOCATION_LEVEL_1,
      JurisdictionType.LOCATION_LEVEL_2,
      JurisdictionType.LOCATION_LEVEL_3,
      JurisdictionType.LOCATION_LEVEL_4,
      JurisdictionType.LOCATION_LEVEL_5
    )
    .optional(),
  statistics: Joi.array().items(locationStatisticSchema).optional()
})

export const updateSchema = Joi.object({
  name: Joi.string().optional(),
  alias: Joi.string().optional(),
  status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE).optional(),
  statistics: locationStatisticSchema.optional()
})

export async function fetchLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const searchParam = request.url.search
  const locationId = request.params.locationId
  let response

  if (locationId) {
    response = await fetchFromHearth(`/Location/${locationId}`)
  } else {
    response = await fetchFromHearth(`/Location${searchParam}`)
  }

  return response
}

export async function createLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const payload = request.payload as Location | Facility
  const newLocation: fhir.Location = composeFhirLocation(payload)
  const partOfLocation = payload.partOf.split('/')[1]

  const locations = await getLocationsByIdentifier(
    `ADMIN_STRUCTURE_${String(payload.statisticalID)}`
  ).catch((err) => {
    throw err
  })

  if (locations.length !== 0) {
    throw conflict(`statisticalID ${payload.statisticalID} already exists`)
  }

  if (partOfLocation !== '0' && Boolean(partOfLocation)) {
    const response = await fetchFromHearth(`/Location?_id=${partOfLocation}`)

    if (response.total === 0) {
      throw badRequest(
        `${partOfLocation} is not a valid location for partOfLocation`
      )
    }
  }

  if (instanceOfJurisdiction(payload) && payload.statistics) {
    const statisticalExtensions = generateStatisticalExtensions(
      payload.statistics
    )
    newLocation.extension = statisticalExtensions
  }

  const response = await sendToFhir(
    JSON.stringify(newLocation),
    '/Location',
    'POST',
    request.headers.authorization
  ).catch((err) => {
    throw Error('Cannot create location to FHIR')
  })

  return h.response(response.statusText)
}

export async function updateLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const locationId = request.params.locationId
  const location = request.payload as UpdateLocation
  const existingLocation = await fetchFromHearth(`/Location?_id=${locationId}`)
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
