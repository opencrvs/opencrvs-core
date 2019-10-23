import { Response } from 'node-fetch'
import { ORG_URL } from '@resources/constants'
import { sendToFhir, ILocation } from '@resources/bgd/features/utils'
import chalk from 'chalk'

export interface IORGFacility {
  facilityId: string
  division: string
  district: string
  districtBn: string
  upazila: string
  upazilaBn: string
  union: string
  unionBn: string
  A2IReference: string
  facilityNameBengali: string
  facilityNameEnglish: string
  facilityTypeBengali: string
  facilityTypeEnglish: string
}

export interface IHRISFacility {
  // there are more properties, however these likely the ones we are interested in
  id: number
  uuid: string
  name: string
  name_BN: string
  code: string
  division_id: number
  division_code: string
  division_name: string
  district_id: number
  district_code: string
  district_name: string
  upazila_id: number
  upazila_code: string
  upazila_name: string
  paurasava_id: number
  paurasava_code: string
  paurasava_name: string
  union_id: number
  union_code: string
  union_name: string
  ward_id: number
  ward_code: string
  ward_name: string
  village_code: string
  house_number: string
  latitude: string
  longitude: string
  landphone1: string
  landphone2: string
  landphone3: string
  mobile1: string
  mobile2: string
  mobile3: string
  email1: string
  email2: string
  email3: string
  facilitytype_id: number
  facilitytype_code: string
  facilitytype_name: string
}

const createFhirLocationFromORGJson = (
  location: IORGFacility,
  partOfReference: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [
      {
        system: `${ORG_URL}/specs/id/internal-id`,
        value: String(location.facilityId)
      }
    ],
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
    address: {
      line: [location.union, location.upazila],
      district: location.district,
      state: location.division
    }
  }
}

const createFhirLocationFromHRISJson = (
  location: IHRISFacility,
  partOfReference: string
): fhir.Location => {
  const resource = {
    resourceType: 'Location',
    identifier: [
      {
        system: `${ORG_URL}/specs/id/hris-internal-id`,
        value: String(location.id)
      },
      { system: `${ORG_URL}/specs/id/hris-uuid`, value: location.uuid },
      { system: `${ORG_URL}/specs/id/hris-code`, value: location.code }
    ],
    name: location.name, // English name
    alias: [location.name_BN], // Bangla name in element 0
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: partOfReference // Reference to the upazila this office falls under
    },
    type: {
      coding: [
        {
          system: `${ORG_URL}/specs/location-type`,
          code: 'HEALTH_FACILITY'
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
    telecom: [] as fhir.ContactPoint[],
    address: {
      line: [location.union_name, location.upazila_name],
      district: location.district_name,
      state: location.division_name
    }
  }

  return resource
}

export function generateSimpleLocationResource(
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

export async function mapAndSaveCRVSFacilities(
  facilities: IORGFacility[],
  divisions: fhir.Location[],
  districts: fhir.Location[],
  upazilas: fhir.Location[],
  unions: fhir.Location[]
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const facility of facilities) {
    const division = findLocationByNameAndParent(
      'division',
      divisions,
      facility.division,
      'Location/0' // this is used for top level locations
    )

    if (!division) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.yellow(
          `WARNING: Division not found for facility ${facility.facilityNameEnglish}`
        )
      )
      continue
    }

    const district = findLocationByNameAndParent(
      'district',
      districts,
      facility.district,
      `Location/${division.id}`
    )

    if (!district) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.yellow(
          // tslint:disable-next-line:max-line-length
          `WARNING: District not found for facility ${facility.facilityNameEnglish} with parent=${division.id}`
        )
      )
      continue
    }

    const upazila = findLocationByNameAndParent(
      'upazila',
      upazilas,
      facility.upazila,
      `Location/${district.id}`
    )

    if (!upazila) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.yellow(
          // tslint:disable-next-line:max-line-length
          `WARNING: Upazila not found for facility ${facility.facilityNameEnglish} with parent=${district.id}`
        )
      )
      continue
    }

    const union = findLocationByNameAndParent(
      'union',
      unions,
      facility.union,
      `Location/${upazila.id}`
    )

    if (!union) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.yellow(
          // tslint:disable-next-line:max-line-length
          `WARNING: Union not found for facility ${facility.facilityNameEnglish} with parent=${upazila.id}`
        )
      )
      continue
    }
    const newLocation: fhir.Location = createFhirLocationFromORGJson(
      facility,
      `Location/${union.id}`
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

function findLocationByIdentifierAndParent(
  resources: fhir.Location[],
  system: string,
  code: string,
  parentRef: string
) {
  return resources.find(resource => {
    if (resource.identifier && resource.partOf && resource.partOf.reference) {
      const foundIdentifier = resource.identifier.find(
        (identifier: fhir.Identifier) =>
          identifier.system === system && identifier.value === code
      )

      const foundParent = resource.partOf.reference === parentRef

      if (foundIdentifier && foundParent) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  })
}

function findLocationByNameAndParent(
  type: string,
  resources: fhir.Location[],
  name: string,
  parentRef: string
) {
  const resourcesArray = resources.filter(resource => {
    if (resource.name && resource.partOf && resource.partOf.reference) {
      return resource.name === name && resource.partOf.reference === parentRef
    } else {
      return false
    }
  })
  if (resourcesArray.length > 1) {
    // tslint:disable-next-line:no-console
    console.log(chalk.yellow(`WARNING: ${type} duplicates found for ${name}`))
  }
  if (!resourcesArray || resourcesArray.length === 0) {
    // tslint:disable-next-line:no-console
    console.log(chalk.yellow(`WARNING: No ${type} found for ${name}`))
  }
  return resourcesArray[0]
}

export async function mapAndSaveHealthFacilities(
  facilities: IHRISFacility[],
  divisions: fhir.Location[],
  districts: fhir.Location[],
  upazilas: fhir.Location[]
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const facility of facilities) {
    const division = findLocationByIdentifierAndParent(
      divisions,
      'http://opencrvs.org/specs/id/bbs-code',
      facility.division_code,
      'Location/0' // this is used for top level locations
    )

    if (!division) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.yellow(
          `WARNING: Division not found for facility ${facility.name}, ignoring it: bbs-code=${facility.upazila_code}`
        )
      )
      continue
    }

    const district = findLocationByIdentifierAndParent(
      districts,
      'http://opencrvs.org/specs/id/bbs-code',
      facility.district_code,
      `Location/${division.id}`
    )

    if (!district) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.yellow(
          // tslint:disable-next-line:max-line-length
          `WARNING: District not found for facility ${facility.name}, ignoring it: bbs-code=${facility.upazila_code} with parent=${division.id}`
        )
      )
      continue
    }

    const upazila = findLocationByIdentifierAndParent(
      upazilas,
      'http://opencrvs.org/specs/id/bbs-code',
      facility.upazila_code,
      `Location/${district.id}`
    )

    if (!upazila) {
      // tslint:disable-next-line:no-console
      console.log(
        chalk.yellow(
          // tslint:disable-next-line:max-line-length
          `WARNING: Upazila not found for facility ${facility.name}, ignoring it: bbs-code=${facility.upazila_code} with parent=${district.id}`
        )
      )
      continue
    }

    const newLocation: fhir.Location = createFhirLocationFromHRISJson(
      facility,
      `Location/${upazila.id}`
    )

    // tslint:disable-next-line:no-console
    console.log(
      `Saving facility ... type: HEALTH_FACILITY, name: ${facility.name}`
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
