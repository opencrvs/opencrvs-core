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
import { fetchFhirWithHearth, sendToFhir } from '@gateway/features/fhir/utils'
import * as Hapi from '@hapi/hapi'
import { internal, badRequest, conflict } from '@hapi/boom'
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

enum PhysicalType {
  Jurisdiction = 'Jurisdiction',
  Building = 'Building'
}

enum JurisdictionType {
  STATE = 'STATE',
  DISTRICT = 'DISTRICT'
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
  jurisdictionType: string
  physicalType: string
  statistics: LocationStatistic[]
}

export type Facility = {
  statisticalID: string
  name: string
  partOf: string
  code: string
  physicalType: string
  district: string
  state: string
}

type UpdateLocation = {
  name: string
  alias: string
  status: string
  statistics: LocationStatistic
}

const locationStatisticSchema = Joi.object({
  year: Joi.number(),
  male_population: Joi.number(),
  female_population: Joi.number(),
  population: Joi.number(),
  crude_birth_rate: Joi.number()
})

export const requestSchema = Joi.object({
  statisticalID: Joi.string(),
  name: Joi.string(),
  partOf: Joi.string(),
  code: Joi.string().valid(
    Code.ADMIN_STRUCTURE,
    Code.CRVS_OFFICE,
    Code.HEALTH_FACILITY
  ),
  physicalType: Joi.string().valid(
    PhysicalType.Building,
    PhysicalType.Jurisdiction
  ),
  jurisdictionType: Joi.string()
    .valid(JurisdictionType.DISTRICT, JurisdictionType.STATE)
    .optional(),
  district: Joi.string().optional(),
  state: Joi.string().optional(),
  statistics: Joi.array().items(locationStatisticSchema).optional()
})
  .with('district', 'state')
  .with('state', 'district')
  .with('jurisdictionType', 'statistics')
  .with('statistics', 'jurisdictionType')
  .without('district', 'statistics')

export const updateSchema = Joi.object({
  name: Joi.string(),
  alias: Joi.string(),
  status: Joi.string().valid(Status.ACTIVE, Status.INACTIVE),
  statistics: locationStatisticSchema
})

export async function fetchLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const searchParam = request.url.search
  const locationId = request.params.locationId
  let response

  if (locationId) {
    response = await fetchFhirWithHearth(`/Location/${locationId}`)
  } else {
    response = await fetchFhirWithHearth(`/Location${searchParam}`)
  }

  if (!response) {
    throw internal('No location has been found')
  } else {
    return {
      location: response
    }
  }
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
    throw conflict(`statisticalID ${payload.statisticalID} is already exist`)
  }

  if (
    partOfLocation !== '0' &&
    (partOfLocation !== null || partOfLocation !== '')
  ) {
    const response = await fetchFhirWithHearth(
      `/Location?_id=${partOfLocation}`
    )

    if (response.total === 0) {
      throw badRequest(
        `${partOfLocation} is not a valid location for partOfLocation`
      )
    }
  }

  if ('statistics' in payload) {
    const statisticalExtensions = generateStatisticalExtensions(
      payload.statistics
    )
    newLocation.extension = statisticalExtensions
  }

  const res = await sendToFhir(
    newLocation,
    '/Location',
    'POST',
    request.headers.authorization
  ).catch((err) => {
    throw Error('Cannot save location to FHIR')
  })

  return res.statusText
}

export async function updateLocationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const locationId = request.params.locationId
  const location = request.payload as UpdateLocation
  const existingLocation = await fetchFhirWithHearth(
    `/Location?_id=${locationId}`
  )
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

  const res = await sendToFhir(
    newLocation,
    `/Location/${locationId}`,
    'PUT',
    request.headers.authorization
  ).catch((err) => {
    throw Error('Cannot save location to FHIR')
  })

  if (!res.ok) {
    throw new Error(
      `FHIR put to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  return res.statusText
}
