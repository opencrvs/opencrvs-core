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
import {
  fetchParentLocationByLocationID,
  fetchPractitionerRole
} from '@metrics/api'
import {
  IAuthHeader,
  IDeclarationsStartedFields,
  IPointLocation
} from '@metrics/features/registration'
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
    dateOfDeclaration: string
    trackingId: string
    declarationLocationId: string
    compositionType: string
    createdBy: string
    updatedBy: string
  }
  sort: number[]
}

const generatePointLocationsFromID = async (
  declarationLocationId: string,
  authHeader: IAuthHeader
): Promise<IPointLocation> => {
  const locations: IPointLocation = {}

  const officeUnion = await fetchParentLocationByLocationID(
    declarationLocationId,
    authHeader
  )

  if (officeUnion === undefined) {
    throw new Error('Office union cannot be found')
  }

  locations.locationLevel5 = officeUnion
  let locationID: string = locations.locationLevel5 as string
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

export async function generateDeclarationStartedPoint(
  searchResult: ISearchResult,
  authHeader: IAuthHeader
): Promise<any> {
  let role = await fetchPractitionerRole(
    searchResult._source.createdBy,
    authHeader
  )

  if (role.includes('REGISTRAR')) {
    role = 'REGISTRAR'
  }

  const fields: IDeclarationsStartedFields = {
    role,
    compositionId: searchResult._id
  }

  const tags = {
    eventType: searchResult._source.event.toUpperCase(),
    ...(await generatePointLocationsFromID(
      `Location/${searchResult._source.declarationLocationId}`,
      authHeader
    ))
  }

  return {
    measurement: 'declarations_started',
    tags,
    fields,
    timestamp: `${parseInt(searchResult._source.createdAt, 10) * 1000000}`
  }
}
