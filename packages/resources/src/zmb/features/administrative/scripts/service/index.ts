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
  sendToFhir,
  ILocation,
  ICSVLocation,
  titleCase
} from '@resources/zmb/features/utils'
import { ORG_URL } from '@resources/constants'

const composeFhirLocation = (
  location: ICSVLocation,
  jurisdictionType: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [
      {
        system: `${ORG_URL}/specs/id/statistical-code`,
        value: `ADMIN_STRUCTURE_${String(location.statisticalID)}`
      },
      {
        system: `${ORG_URL}/specs/id/jurisdiction-type`,
        value: jurisdictionType
      }
    ],
    name: titleCase(location.name), // English name
    alias: [titleCase(location.name)], // Additional language name in element 0
    description: location.statisticalID,
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: location.partOf
    },
    type: {
      coding: [
        {
          system: `${ORG_URL}/specs/location-type`,
          code: 'ADMIN_STRUCTURE'
        }
      ]
    },
    physicalType: {
      coding: [
        {
          code: 'jdn',
          display: 'Jurisdiction'
        }
      ]
    },
    extension: [
      {
        url:
          'http://hl7.org/fhir/StructureDefinition/location-boundary-geojson',
        valueAttachment: {
          contentType: 'application/geo+json',
          data: '<base64>' // base64 encoded geoJSON feature object
        }
      }
    ]
  }
}

export function generateLocationResource(
  fhirLocation: fhir.Location
): ILocation {
  const loc = {} as ILocation
  loc.id = fhirLocation.id
  loc.name = fhirLocation.name
  loc.alias = fhirLocation.alias && fhirLocation.alias[0]
  loc.physicalType =
    fhirLocation.physicalType &&
    fhirLocation.physicalType.coding &&
    fhirLocation.physicalType.coding[0].display
  if (
    fhirLocation &&
    fhirLocation.identifier &&
    fhirLocation.identifier[2] &&
    fhirLocation.identifier[2].value
  ) {
    loc.jurisdictionType =
      fhirLocation.identifier && fhirLocation.identifier[2].value
  }
  loc.type =
    fhirLocation.type &&
    fhirLocation.type.coding &&
    fhirLocation.type.coding[0].code
  loc.partOf = fhirLocation.partOf && fhirLocation.partOf.reference
  return loc
}

export async function fetchAndComposeLocations(
  rawLocationData: ICSVLocation[],
  jurisdictionType: string
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const csvLocation of rawLocationData) {
    const newLocation: fhir.Location = composeFhirLocation(
      csvLocation,
      jurisdictionType
    )

    const savedLocationResponse = await sendToFhir(
      newLocation,
      '/Location',
      'POST'
    ).catch(err => {
      throw Error('Cannot save location to FHIR')
    })
    const locationHeader = savedLocationResponse.headers.get(
      'location'
    ) as string
    newLocation.id = locationHeader.split('/')[3]
    locations.push(newLocation)
  }
  return locations
}

export function getLocationPartOfIds(
  rawLocationData: ICSVLocation[],
  provinces: fhir.Location[]
): ICSVLocation[] {
  const locations: ICSVLocation[] = []
  for (const csvLocation of rawLocationData) {
    const partOfStatisticalID = csvLocation.partOf.split('/')[1]
    const parentProvince = provinces.filter(province => {
      return province.description === partOfStatisticalID
    })[0]
    csvLocation.partOf = `Location/${parentProvince.id}`
    locations.push(csvLocation)
  }
  return locations
}
