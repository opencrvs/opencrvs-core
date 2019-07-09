import fetch, { Response } from 'node-fetch'
import { ADMINISTRATIVE_STRUCTURE_URL, ORG_URL } from '@resources/constants'
import {
  sendToFhir,
  IOISFLocation,
  ILocation,
  titleCase
} from '@resources/features/utils/bn'
import chalk from 'chalk'

const composeFhirLocation = (
  location: IOISFLocation,
  jurisdictionType: string,
  partOfReference: string,
  oisfA2IParams?: string
): fhir.Location => {
  return {
    resourceType: 'Location',
    identifier: [
      {
        system: `${ORG_URL}/specs/id/a2i-internal-id`,
        value: String(location.id)
      },
      {
        system: `${ORG_URL}/specs/id/bbs-code`,
        value: location.bbsCode
      },
      {
        system: `${ORG_URL}/specs/id/jurisdiction-type`,
        value: jurisdictionType
      }
    ],
    name: titleCase(location.name), // English name
    alias: [location.nameBn], // Bangla name in element 0
    description: oisfA2IParams as string, // Reference to the route params used internally in OISF/A2I to find this location
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

const makeOISFParams = (route: string, id: number): string => {
  const splitRoute = route.split('?')
  return `${splitRoute[1]}&${splitRoute[0]}=${id}`
}

export async function fetchAndComposeLocations(
  route: string,
  partOfReference: string,
  jurisdictionType: string
): Promise<fhir.Location[]> {
  const body = await getLocationsFromOISF(route).catch(err => {
    throw Error('Cannot retrieve locations from OISF')
  })

  const locations: fhir.Location[] = []
  for (const oisfLocation of body) {
    let oisfA2IParams: string
    if (partOfReference === '0') {
      oisfA2IParams = `${route}=${oisfLocation.id}`
    } else {
      oisfA2IParams = makeOISFParams(route, oisfLocation.id)
    }

    const newLocation: fhir.Location = composeFhirLocation(
      oisfLocation,
      jurisdictionType,
      partOfReference,
      oisfA2IParams
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

export async function getLocationsByParentDivisions(
  jurisdictionType: string,
  parentDivisions: fhir.Location[]
): Promise<fhir.Location[]> {
  let locations: fhir.Location[] = []
  let queryRoute: string
  let queryResult: fhir.Location[] = []
  for (const parentDivision of parentDivisions) {
    queryRoute = `${jurisdictionType}?${parentDivision.description}`
    queryResult = await fetchAndComposeLocations(
      queryRoute,
      parentDivision.id as string,
      jurisdictionType.toUpperCase()
    )
    locations = appendLocations(locations, queryResult)
  }
  return locations
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

export async function getLocationsFromOISF(route: string): Promise<any> {
  const url = `${ADMINISTRATIVE_STRUCTURE_URL}/${route}`
  // tslint:disable-next-line:no-console
  console.log(`Fetching: ${url}.`)
  // tslint:disable-next-line:no-console
  console.log(
    // tslint:disable-next-line
    `${chalk[getRandomColor()]('Please wait, will take 10 minutes ....')}`
  )
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  return await res.json()
}
