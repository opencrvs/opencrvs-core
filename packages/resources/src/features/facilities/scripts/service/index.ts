import { Response } from 'node-fetch'
import { ORG_URL } from '@resources/constants'
import {
  getLocationIDByDescription,
  sendToFhir,
  ILocation
} from '@resources/features/utils/bn'

interface IDGHSFacility {
  division: string
  district: string
  upazila: string
  union: string
  A2IReference: string
  facilityNameBengali: string
  facilityNameEnglish: string
  facilityTypeBengali: string
  facilityTypeEnglish: string
  email: string
  phone: string
}

const composeFhirLocation = (
  location: IDGHSFacility,
  partOfReference: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [],
    name: location.facilityNameEnglish, // English name
    alias: [location.facilityNameBengali], // Bangla name in element 0
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: partOfReference // Reference to the location this office falls under, if any
    },
    type: {
      coding: [
        {
          system: `${ORG_URL}/specs/location-type`,
          code: location.facilityTypeEnglish
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
    telecom: [
      { system: 'phone', value: location.phone },
      { system: 'email', value: location.email }
    ],
    address: {
      line: [location.union, location.upazila],
      district: location.district,
      state: location.division
    }
  }
}

export function generateLocationResource(
  fhirLocation: fhir.Location
): ILocation {
  const loc = {} as ILocation
  loc.id = fhirLocation.id
  loc.name = fhirLocation.name
  loc.nameBn = fhirLocation.alias && fhirLocation.alias[0]
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

export async function composeAndSaveFacilities(
  facilities: IDGHSFacility[],
  parentLocations: fhir.Location[]
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const facility of facilities) {
    const parentLocationID = getLocationIDByDescription(
      parentLocations,
      facility.A2IReference
    )
    const newLocation: fhir.Location = composeFhirLocation(
      facility,
      `Location/${parentLocationID}`
    )
    // tslint:disable-next-line:no-console
    console.log(
      `Saving facility ... type: ${facility.facilityTypeEnglish}, name: ${facility.facilityNameEnglish}`
    )
    const savedLocationResponse = (await sendToFhir(
      newLocation,
      '/Location',
      'POST'
    ).catch(err => {
      throw Error('Cannot save location to FHIR')
    })) as Response
    const locationHeader = savedLocationResponse.headers.get(
      'location'
    ) as string
    newLocation.id = locationHeader.split('/')[3]
    locations.push(newLocation)
  }
  return locations
}
