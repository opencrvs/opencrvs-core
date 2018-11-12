import fetch from 'node-fetch'
import { ADMINISTRATIVE_STRUCTURE_URL } from '../../../../constants'
import { logger } from '../../../../logger'
import { v4 as uuid } from 'uuid'

interface IOISFLocation {
  bbsCode: string
  name: string
  nameBn: string
  id: number
}

const composeFhir = (
  location: IOISFLocation,
  partOfReference: string,
  oisfA2IParams?: string
): fhir.Location => {
  return {
    id: uuid(),
    resourceType: 'Location',
    identifier: [
      {
        system: 'http://opencrvs.org/specs/id/a2i-internal-id',
        value: String(location.id)
      },
      {
        system: 'http://opencrvs.org/specs/id/bbs-code',
        value: location.bbsCode
      }
    ],
    name: location.name, // English name
    alias: [location.nameBn], // Bangla name in element 0
    description: oisfA2IParams as string, // Reference to the route params used internally in OISF/A2I to find this location
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: `Location/${partOfReference}` // Reference to the admin location that is one level up from this one.
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
  partOfReference: string
): Promise<fhir.Location[]> {
  const url = `${ADMINISTRATIVE_STRUCTURE_URL}/${route}`
  logger.info(`Fetching: ${url}`)
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  const locations: fhir.Location[] = []
  const body = await res.json()

  body.forEach((location: IOISFLocation) => {
    let oisfA2IParams: string
    if (partOfReference === '0') {
      oisfA2IParams = `${route}=${location.id}`
    } else {
      oisfA2IParams = makeOISFParams(route, location.id)
    }

    locations.push(composeFhir(location, partOfReference, oisfA2IParams))
  })
  return locations
}

export async function getLocationsByParentDivisions(
  divisionType: string,
  parentDivisions: fhir.Location[]
): Promise<fhir.Location[]> {
  let locations: fhir.Location[] = []
  let queryRoute: string
  let queryResult: fhir.Location[] = []
  for (const parentDivision of parentDivisions) {
    queryRoute = `${divisionType}?${parentDivision.description}`
    queryResult = await fetchAndComposeLocations(
      queryRoute,
      parentDivision.id as string
    )
    locations = appendLocations(locations, queryResult)
  }
  return locations
}
