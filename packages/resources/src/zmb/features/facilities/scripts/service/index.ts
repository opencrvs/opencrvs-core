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
  ILocation,
  getLocationIDByDescription,
  sendToFhir
} from '@resources/zmb/features/utils'
import { ORG_URL } from '@resources/constants'

interface IFacility {
  statisticalID: string
  name: string
  partOf: string
  code: string
  physicalType: string
  district: string
  state: string
}

const composeFhirLocation = (
  location: IFacility,
  partOfReference: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [
      {
        system: `${ORG_URL}/specs/id/internal-id`,
        value: `${location.code}_${String(location.statisticalID)}`
      }
    ],
    name: location.name, // English name
    alias: [location.name], // Secondary language name in element 0
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: partOfReference // Reference to the location this office falls under, if any
    },
    type: {
      coding: [
        {
          system: `${ORG_URL}/specs/location-type`,
          code: location.code
        }
      ]
    },
    physicalType: {
      coding: [
        {
          code: 'bu',
          display: 'Building'
        }
      ]
    },
    telecom: [],
    address: {
      line: [],
      district: location.district,
      state: location.state
    }
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
  loc.type =
    fhirLocation.type &&
    fhirLocation.type.coding &&
    fhirLocation.type.coding[0].code
  loc.partOf = fhirLocation.partOf && fhirLocation.partOf.reference
  return loc
}

function getPartOfIdForFacility(facility: IFacility): string {
  if (facility.code === 'HEALTH_FACILITY') {
    return facility.partOf.split('/')[1]
  } else {
    return facility.statisticalID
  }
}

export async function composeAndSaveFacilities(
  facilities: IFacility[],
  parentLocations: fhir.Location[]
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const facility of facilities) {
    const parentLocationID = getLocationIDByDescription(
      parentLocations,
      getPartOfIdForFacility(facility)
    )
    const newLocation: fhir.Location = composeFhirLocation(
      facility,
      `Location/${parentLocationID}`
    )
    // tslint:disable-next-line:no-console
    console.log(
      `Saving facility ... type: ${facility.code}, name: ${facility.name}`
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
