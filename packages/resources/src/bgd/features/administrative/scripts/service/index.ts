import fetch, { Response } from 'node-fetch'
import {
  ADMINISTRATIVE_STRUCTURE_URL,
  A2I_ENDPOINT_SECRET
} from '@resources/bgd/constants'
import { ORG_URL } from '@resources/constants'
import {
  sendToFhir,
  IOISFLocation,
  IOISFLocationResponse,
  ILocation,
  titleCase,
  getA2iInternalRefIndentifierOfLocation
} from '@resources/bgd/features/utils'
import chalk from 'chalk'

export const A2I_LOCATION_REFERENCE_IDENTIFIER = `${ORG_URL}/specs/id/a2i-internal-reference`
const composeFhirLocation = (
  location: IOISFLocation,
  jurisdictionType: string,
  partOfReference: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [
      {
        system: `${ORG_URL}/specs/id/geo-id`,
        value: String(location.geo_id)
      },
      {
        system: `${ORG_URL}/specs/id/bbs-code`,
        value: location.bbs_code
      },
      {
        system: `${ORG_URL}/specs/id/jurisdiction-type`,
        value: jurisdictionType
      },
      {
        // Reference to the route params used internally in OISF/A2I to find this location
        system: A2I_LOCATION_REFERENCE_IDENTIFIER,
        value: location.a2i_reference
      }
    ],
    name: titleCase(location.name_eng), // English name
    alias: [location.name_bng], // Bangla name in element 0
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: `Location/${partOfReference}` // Reference to the admin location that is one level up from this one.
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

export const appendLocations = (
  locations: fhir.Location[],
  newLocations: fhir.Location[]
): fhir.Location[] => {
  return newLocations.reduce((total, item) => {
    total.push(item)
    return total
  }, locations)
}

export async function getTokenForOISF() {
  const tokenResponse = await fetchFromOISF(
    'token/create',
    {
      Authorization: `Secret ${A2I_ENDPOINT_SECRET}`
    },
    'POST'
  )
  return tokenResponse.token
}

export async function fetchAndProcessLocationsFromOISF(): Promise<
  IOISFLocationResponse
> {
  const locationResponse = await fetchFromOISF(
    'nothi/api/v1/geo/divisions',
    { Authorization: `Bearer ${await getTokenForOISF()}` },
    'POST'
  )
  const divisions: IOISFLocation[] = []
  const districts: IOISFLocation[] = []
  const upazilas: IOISFLocation[] = []
  const unions: IOISFLocation[] = []
  Object.keys(locationResponse.data).forEach(divisionId => {
    // gathering division data
    const rawDivisionData = locationResponse.data[divisionId]
    divisions.push({
      geo_id: rawDivisionData.geo_division_id,
      name_bng: rawDivisionData.division_name_bng,
      name_eng: rawDivisionData.division_name_eng,
      bbs_code: rawDivisionData.bbs_code,
      a2i_reference: `division=${rawDivisionData.geo_division_id}`
    })
    // gathering district data
    Object.keys(rawDivisionData.districts).forEach(districtId => {
      const rawDistrictData = rawDivisionData.districts[districtId]
      districts.push({
        geo_id: rawDistrictData.geo_district_id,
        name_bng: rawDistrictData.district_name_bng,
        name_eng: rawDistrictData.district_name_eng,
        bbs_code: rawDistrictData.bbs_code,
        a2i_reference:
          `division=${rawDivisionData.geo_division_id}` +
          `&district=${rawDistrictData.geo_district_id}`
      })
      // gathering upazila data
      Object.keys(rawDistrictData.upazilas).forEach(upazilaId => {
        const rawUpazilaData = rawDistrictData.upazilas[upazilaId]
        upazilas.push({
          geo_id: rawUpazilaData.geo_upazila_id,
          name_bng: rawUpazilaData.upazila_name_bng,
          name_eng: rawUpazilaData.upazila_name_eng,
          bbs_code: rawUpazilaData.bbs_code,
          a2i_reference:
            `division=${rawDivisionData.geo_division_id}` +
            `&district=${rawDistrictData.geo_district_id}` +
            `&upazila=${rawUpazilaData.geo_upazila_id}`
        })
        // gathering union data
        Object.keys(rawUpazilaData.unions).forEach(unionId => {
          const rawUnionData = rawUpazilaData.unions[unionId]
          unions.push({
            geo_id: rawUnionData.geo_union_id,
            name_bng: rawUnionData.union_name_bng,
            name_eng: rawUnionData.union_name_eng,
            bbs_code: rawUnionData.bbs_code,
            a2i_reference:
              `division=${rawDivisionData.geo_division_id}` +
              `&district=${rawDistrictData.geo_district_id}` +
              `&upazila=${rawUpazilaData.geo_upazila_id}` +
              `&union=${rawUnionData.geo_union_id}`
          })
        })
      })
    })
  })
  return {
    divisions,
    districts,
    upazilas,
    unions
  }
}

export async function composeAndSaveLocations(
  oisfLocations: IOISFLocation[],
  jurisdictionType: string,
  partOfReference: string
): Promise<fhir.Location[]> {
  const locations: fhir.Location[] = []
  for (const oisfLocation of oisfLocations) {
    const newLocation: fhir.Location = composeFhirLocation(
      oisfLocation,
      jurisdictionType,
      partOfReference
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

export async function composeAndSaveLocationsByParent(
  oisfLocations: IOISFLocation[],
  jurisdictionType: string,
  parentLocations: fhir.Location[]
): Promise<fhir.Location[]> {
  let locations: fhir.Location[] = []
  let queryResult: fhir.Location[] = []
  for (const parentLocation of parentLocations) {
    const parentIdentifier = getA2iInternalRefIndentifierOfLocation(
      parentLocation
    )
    if (!parentIdentifier) {
      // tslint:disable-next-line:no-console
      console.log(
        `${chalk.yellow('No a2i internal reference found for location :')}${
          parentLocation.id
        }`
      )
      continue
    }
    queryResult = await composeAndSaveLocations(
      oisfLocations.filter(loc =>
        loc.a2i_reference.startsWith(`${parentIdentifier.value}&`)
      ),
      jurisdictionType.toUpperCase(),
      parentLocation.id as string
    )
    locations = appendLocations(locations, queryResult)
  }
  return locations
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

const chalkColors = [
  'green',
  'yellow',
  'magenta',
  'cyan',
  'redBright',
  'greenBright',
  'yellowBright',
  'blueBright',
  'magentaBright',
  'cyanBright',
  'whiteBright'
]

function getRandomColor(): string {
  // tslint:disable-next-line
  return chalkColors[Math.floor(Math.random() * chalkColors.length)]
}

export interface IOISFAuthHeader {
  Authorization: string
}

export async function fetchFromOISF(
  route: string,
  header: IOISFAuthHeader,
  method: string = 'GET'
): Promise<any> {
  const url = `${ADMINISTRATIVE_STRUCTURE_URL}/${route}`
  // tslint:disable-next-line:no-console
  console.log(`Fetching: ${url}.`)
  // tslint:disable-next-line:no-console
  console.log(
    // tslint:disable-next-line
    `${chalk[getRandomColor()]('Please wait, will take 10 minutes ....')}`
  )
  const res = await fetch(url, {
    method,
    headers: {
      ...header
    }
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  return await res.json()
}
