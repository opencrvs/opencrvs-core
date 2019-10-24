import { Response } from 'node-fetch'
import { ORG_URL } from '@resources/constants'
import { sendToFhir, ILocation } from '@resources/bgd/features/utils'
import chalk from 'chalk'
import { findBestMatch, BestMatch } from 'string-similarity'

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
  unions: fhir.Location[],
  pilotLocations: string[]
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
          `WARNING: A2I Division not found for facility ${facility.facilityNameEnglish}`
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
      if (pilotLocations.includes(facility.upazila)) {
        // tslint:disable-next-line:no-console
        console.log(
          chalk.red(
            // tslint:disable-next-line:max-line-length
            `PILOT WARNING: A2I District not found or matched for facility ,${facility.facilityNameEnglish} in division: ${facility.division} with parent division FHIR id:${division.id}`
          )
        )
      } else {
        // tslint:disable-next-line:no-console
        console.log(
          chalk.yellow(
            // tslint:disable-next-line:max-line-length
            `WARNING: A2I District not found or matched for facility ,${facility.facilityNameEnglish} in division: ${facility.division} with parent division FHIR id:${division.id}`
          )
        )
      }
      continue
    }

    const upazila = findLocationByNameAndParent(
      'upazila',
      upazilas,
      facility.upazila,
      `Location/${district.id}`
    )

    if (!upazila) {
      if (pilotLocations.includes(facility.upazila)) {
        // tslint:disable-next-line:no-console
        console.log(
          chalk.red(
            // tslint:disable-next-line:max-line-length
            `PILOT WARNING: A2I Upazila not found or matched for facility ,${facility.facilityNameEnglish}` +
              ` in district: ${facility.district} and division: ${facility.division} with parent district FHIR id: ${district.id}`
          )
        )
      } else {
        // tslint:disable-next-line:no-console
        console.log(
          chalk.yellow(
            // tslint:disable-next-line:max-line-length
            `WARNING: A2I Upazila not found or matched for facility ,${facility.facilityNameEnglish}` +
              ` in district: ${facility.district} and division: ${facility.division} with parent district FHIR id: ${district.id}`
          )
        )
      }
      continue
    }

    const union = findLocationByNameAndParent(
      'union',
      unions,
      facility.union,
      `Location/${upazila.id}`
    )

    if (!union) {
      if (pilotLocations.includes(facility.upazila)) {
        // tslint:disable-next-line:no-console
        console.log(
          chalk.red(
            // tslint:disable-next-line:max-line-length
            `PILOT WARNING: A2I Union not found or matched for facility ,${facility.facilityNameEnglish},` +
              ` in upazila: ,${facility.upazila}, district: ,${facility.district}, and division:` +
              ` ,${facility.division}, with parent upazila FHIR id: ${upazila.id}`
          )
        )
      } else {
        // tslint:disable-next-line:no-console
        console.log(
          chalk.yellow(
            // tslint:disable-next-line:max-line-length
            `WARNING: A2I Union not found or matched for facility ,${facility.facilityNameEnglish}, in upazila: ,` +
              `${facility.upazila}, district: ,${facility.district}, and division: ,${facility.division}, ` +
              `with parent upazila FHIR id: ${upazila.id}`
          )
        )
      }
      continue
    }
    const newLocation: fhir.Location = createFhirLocationFromORGJson(
      facility,
      `Location/${union.id}`
    )
    // tslint:disable-next-line:no-console
    /*console.log(
      `Saving facility ... type: ${facility.facilityTypeEnglish}, name: ${facility.facilityNameEnglish}`
    )*/
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
  const namesArray: string[] = []
  let resourcesArray = resources.filter(resource => {
    if (resource.name && resource.partOf && resource.partOf.reference) {
      namesArray.push(resource.name)
      return (
        resource.name.toUpperCase() === name.toUpperCase() &&
        resource.partOf.reference === parentRef
      )
    } else {
      return false
    }
  })
  if (resourcesArray.length > 1) {
    // tslint:disable-next-line:no-console
    console.log(chalk.yellow(`WARNING: ${type} duplicates found for ${name}`))
  }
  if (!resourcesArray || resourcesArray.length === 0) {
    /*
      The CRVS Facilities were supplied as an Excel sheet.  It has been manually created and there
      are many differences in the spellings of both the English and Bengali names between the parent
      union, upazila, district and the spelling of the same in the A2I api.  As we have no BBS codes
      or reference to use to match, we have to find the best match using the name.  To see a list of
      offices that the script is unable to exactly match, uncomment the logs below.
    */

    // tslint:disable-next-line:no-console
    /*console.log(
      chalk.white(
        `WARNING: No exact match ${type} found for ${name}. Attempting tp find best match ...`
      )
    )*/
    const bestMatchResult: BestMatch = findBestMatch(name, namesArray)
    // tslint:disable-next-line:no-console
    /*console.log(
      chalk.white(
        `WARNING: Best match for ${name} is ${bestMatchResult.bestMatch.target}, using it instead.`
      )
    )*/
    resourcesArray = resources.filter(resource => {
      if (
        resource.name &&
        resource.name === bestMatchResult.bestMatch.target &&
        resource.partOf &&
        resource.partOf.reference === parentRef
      ) {
        // tslint:disable-next-line:no-console
        /*console.log(
          chalk.white(
            `WARNING: Best match for ${name} is ${bestMatchResult.bestMatch.target}, using it instead.`
          )
        )*/
        return true
      } else {
        return false
      }
    })
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
