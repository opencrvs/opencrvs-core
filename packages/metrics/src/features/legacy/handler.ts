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
import * as Hapi from 'hapi'
import { internal } from 'boom'
import {
  fetchAllFromSearch,
  fetchFHIR,
  fetchParentLocationByLocationID
} from '@metrics/api'
import {
  IAuthHeader,
  IApplicationsStartedFields,
  IApplicationsStartedPoints,
  IPointLocation
} from '@metrics/features/registration'
import { writePoints } from '@metrics/influxdb/client'

interface ISearchResult {
  _index: string
  _type: string
  _id: string
  _score: number
  _source: {
    event: string
    createdAt: string
    operationHistories: [
      {
        operationType: string
        operatedOn: string
        operatorRole: string
        operatorFirstNames: string
        operatorFamilyName: string
        operatorFirstNamesLocale: string
        operatorFamilyNameLocale: string
        operatorOfficeName: string
        operatorOfficeAlias: string[]
        notificationFacilityName: string
        notificationFacilityAlias: string[]
      }
    ]
    childFirstNames: string
    childFamilyName: string
    childFirstNamesLocal: string
    childFamilyNameLocal: string
    childDoB: string
    gender: string
    eventLocationId: string
    motherFirstNames: string
    motherFamilyName: string
    motherFirstNamesLocal: string
    motherFamilyNameLocal: string
    motherDoB: string
    motherIdentifier: string
    fatherFirstNames: string
    fatherFamilyName: string
    fatherFirstNamesLocal: string
    fatherFamilyNameLocal: string
    fatherDoB: string
    contactNumber: string
    type: string
    dateOfApplication: string
    trackingId: string
    applicationLocationId: string
    compositionType: string
    createdBy: string
    updatedBy: string
  }
  sort: number[]
}

export async function generateLegacyMetricsHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  let result: any
  const authHeader = {
    Authorization: request.headers.authorization
  }
  try {
    result = await fetchAllFromSearch(authHeader)
  } catch (err) {
    return internal(err)
  }
  const totalPoints: IApplicationsStartedPoints[] = []
  if (result.body.hits.total !== result.body.hits.hits.length) {
    throw new Error(
      'Not all results returned in search results.  Need to implement Elastic pagination for more than 10,000 records'
    )
  }
  const searchResults: ISearchResult[] = result.body.hits.hits
  for (const searchResult of searchResults) {
    const points: IApplicationsStartedPoints = await generateApplicationStartedPoint(
      searchResult,
      authHeader
    )
    totalPoints.push(points)
  }
  await writePoints(totalPoints)
  return h.response(totalPoints).code(200)
}

export async function getRoleFromSearchResult(
  searchResult: ISearchResult,
  authHeader: IAuthHeader
): Promise<any> {
  const roleBundle: fhir.Bundle = await fetchFHIR(
    `PractitionerRole?practitioner=${searchResult._source.createdBy}`,
    authHeader
  )
  const practitionerRole =
    roleBundle &&
    roleBundle.entry &&
    roleBundle.entry &&
    roleBundle.entry.length > 0 &&
    (roleBundle.entry[0].resource as fhir.PractitionerRole)

  const roleCode =
    practitionerRole &&
    practitionerRole.code &&
    practitionerRole.code.length > 0 &&
    practitionerRole.code[0].coding &&
    practitionerRole.code[0].coding[0].code

  if (roleCode) {
    return roleCode
  } else {
    throw new Error('Role code cannot be found')
  }
}

const generatePointLocationsFromID = async (
  applicationLocationId: string,
  authHeader: IAuthHeader
): Promise<IPointLocation> => {
  const locations: IPointLocation = {}

  const officeBundle: fhir.Location = await fetchFHIR(
    applicationLocationId,
    authHeader
  )

  const officeUnion = officeBundle && officeBundle.partOf?.reference
  if (!officeUnion) {
    throw new Error('Office union cannot be found')
  }

  locations.locationLevel5 = officeUnion
  let locationID: string = locations.locationLevel5
  // tslint:disable-next-line no-increment-decrement
  for (let index = 4; index > 1; index--) {
    locationID = await fetchParentLocationByLocationID(locationID, authHeader)
    if (!locationID) {
      break
    }
    locations[`locationLevel${index}`] = locationID
  }

  return locations
}

export async function generateApplicationStartedPoint(
  searchResult: ISearchResult,
  authHeader: IAuthHeader
): Promise<any> {
  const fields: IApplicationsStartedFields = {
    role: await getRoleFromSearchResult(searchResult, authHeader),
    compositionId: searchResult._id
  }

  const tags = {
    eventType: searchResult._source.event.toUpperCase(),
    ...(await generatePointLocationsFromID(
      `Location/${searchResult._source.applicationLocationId}`,
      authHeader
    ))
  }

  return {
    measurement: 'applications_started',
    tags,
    fields,
    timestamp: `${parseInt(searchResult._source.createdAt, 10) * 1000000}`
  }
}
