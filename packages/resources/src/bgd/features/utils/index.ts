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
import fetch from 'node-fetch'
import { FHIR_URL } from '@resources/constants'
import { A2I_LOCATION_REFERENCE_IDENTIFIER } from '@resources/bgd/features/administrative/scripts/service'
import { internal } from 'boom'

export const OPENCRVS_SPECIFICATION_URL = 'http://opencrvs.org/specs/'
export const JURISDICTION_TYPE_DISTRICT = 'district'
export const JURISDICTION_TYPE_UPAZILA = 'upazila'
export const JURISDICTION_TYPE_UNION = 'union'
export const JURISDICTION_TYPE_MUNICIPALITY = 'municipality'
export const JURISDICTION_TYPE_CITY_CORPORATION = 'citycorporation'
export const GENERATE_TYPE_RN = 'registrationNumber'

type ISupportedType =
  | fhir.Practitioner
  | fhir.PractitionerRole
  | fhir.Location
  | IOISFLocation

export interface IOISFLocation {
  geo_id: string
  name_bng: string
  name_eng: string
  bbs_code: string
  a2i_reference: string
}

export interface IOISFLocationResponse {
  divisions: IOISFLocation[]
  districts: IOISFLocation[]
  upazilas: IOISFLocation[]
  unions: IOISFLocation[]
}

export interface IStatistic {
  [key: string]: string
}

export interface ILocation {
  id?: string
  name?: string
  alias?: string
  physicalType?: string
  jurisdictionType?: string
  type?: string
  partOf?: string
}

export interface ILocationSequenceNumber {
  year: string
  reference: string
  sequence_number: string
}

export interface IJurisdictionLocation {
  jurisdictionType: string
  bbsCode: string
}

export const sendToFhir = (
  doc: ISupportedType,
  suffix: string,
  method: string
) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    method,
    body: JSON.stringify(doc),
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response
    })
    .catch(error => {
      return Promise.reject(
        new Error(`FHIR ${method} failed: ${error.message}`)
      )
    })
}

export async function getLocationsByIdentifier(identifier: string) {
  try {
    const locationSearchResult = await getFromFhir(
      `/Location/?identifier=${identifier}&_count=0`
    )
    return (
      (locationSearchResult &&
        locationSearchResult.entry &&
        locationSearchResult.entry.map(
          (locationEntry: fhir.BundleEntry) =>
            locationEntry.resource as fhir.Location
        )) ||
      []
    )
  } catch (err) {
    return internal(err)
  }
}

export function matchLocationWithA2IRef(
  location: fhir.Location,
  a2IReference: string
) {
  const refIdentifier = getA2iInternalRefIndentifierOfLocation(location)

  return refIdentifier ? refIdentifier.value === a2IReference : false
}

export function getA2iInternalRefIndentifierOfLocation(
  location: fhir.Location
) {
  return (
    location.identifier &&
    location.identifier.find(
      identifier => identifier.system === A2I_LOCATION_REFERENCE_IDENTIFIER
    )
  )
}
export const getFromFhir = (suffix: string) => {
  return fetch(`${FHIR_URL}${suffix}`, {
    headers: {
      'Content-Type': 'application/json+fhir'
    }
  })
    .then(response => {
      return response.json()
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export function checkDuplicate(
  propertyName: string,
  inputArray: ISupportedType[]
): boolean {
  const valueArr = inputArray.map((item: ISupportedType) => {
    return item[propertyName]
  })
  const isDuplicate = valueArr.some((item, index) => {
    return valueArr.indexOf(item) !== index
  })

  return isDuplicate
}

export const titleCase = (str: string) => {
  const stringArray = str.toLowerCase().split(' ')
  // tslint:disable-next-line
  for (let i = 0; i < stringArray.length; i++) {
    stringArray[i] =
      stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1)
  }
  return stringArray.join(' ')
}

export async function getPractitionerLocationId(
  practitionerId: string
): Promise<string> {
  const locations: fhir.Location[] = await getPractitionerLocations(
    practitionerId
  )
  const union = locations.find(location => {
    const jurisdictionIdentifier =
      location.identifier &&
      location.identifier.find(
        identifier =>
          identifier.system ===
          `${OPENCRVS_SPECIFICATION_URL}id/jurisdiction-type`
      )
    if (!jurisdictionIdentifier) {
      return false
    }
    return (
      // TODO: Once we receive api update from OISF,
      // Need to add MUNICIPALITY || CITY_CORPORATION type here
      jurisdictionIdentifier.value === JURISDICTION_TYPE_UNION.toUpperCase()
    )
  })

  if (!union || !union.id) {
    throw new Error(
      `No valid union found for given practioner: ${practitionerId}`
    )
  }
  return union.id
}

export async function getPractitionerLocations(
  practitionerId: string
): Promise<fhir.Location[]> {
  const roleResponse = await getFromFhir(
    `/PractitionerRole?practitioner=${practitionerId}`
  )
  const roleEntry = roleResponse.entry[0].resource
  if (!roleEntry || !roleEntry.location) {
    throw new Error('PractitionerRole has no locations associated')
  }
  const locList = []
  for (const location of roleEntry.location) {
    const splitRef = location.reference.split('/')
    const locationResponse: fhir.Location = await getFromFhir(
      `/Location/${splitRef[1]}`
    )
    if (!locationResponse) {
      throw new Error(`Location not found for ${location}`)
    }
    locList.push(locationResponse)
  }
  return locList as fhir.Location[]
}

export function getJurisDictionalLocations() {
  return [
    {
      jurisdictionType: JURISDICTION_TYPE_DISTRICT,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UPAZILA,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_UNION,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_MUNICIPALITY,
      bbsCode: ''
    },
    {
      jurisdictionType: JURISDICTION_TYPE_CITY_CORPORATION,
      bbsCode: ''
    }
  ]
}

export function setRMOCode(locations: IJurisdictionLocation[]) {
  const rmoLocationTypes = [
    JURISDICTION_TYPE_UNION,
    JURISDICTION_TYPE_MUNICIPALITY,
    JURISDICTION_TYPE_CITY_CORPORATION
  ]

  const jurisdictionLocation = locations.find(
    location =>
      location.bbsCode && rmoLocationTypes.includes(location.jurisdictionType)
  )

  if (jurisdictionLocation) {
    if (jurisdictionLocation.jurisdictionType === JURISDICTION_TYPE_UNION) {
      addRmoTypesInJurisdictionLocations(locations, 1)
    } else if (
      jurisdictionLocation.jurisdictionType === JURISDICTION_TYPE_MUNICIPALITY
    ) {
      addRmoTypesInJurisdictionLocations(locations, 2)
    } else if (
      jurisdictionLocation.jurisdictionType ===
      JURISDICTION_TYPE_CITY_CORPORATION
    ) {
      addRmoTypesInJurisdictionLocations(locations, 9)
    }
  }
}

export function addRmoTypesInJurisdictionLocations(
  jurisdictionLocation: IJurisdictionLocation[],
  code: number
) {
  jurisdictionLocation.splice(1, 0, {
    jurisdictionType: 'rmo',
    bbsCode: code.toString()
  })
}

export function convertStringToASCII(str: string): string {
  return [...str]
    .map(char => char.charCodeAt(0).toString())
    .reduce((acc, v) => acc.concat(v))
}

export function convertNumberToString(value: number, size: number) {
  return value.toString().padStart(size, '0')
}
