import fetch, { Response } from 'node-fetch'
import { ADMINISTRATIVE_STRUCTURE_URL, ORG_URL } from '../../../../constants'
import { sendToFhir, IOISFLocation } from '../../../utils/bn'

const composeFhirLocation = (
  location: IOISFLocation,
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
  partOfReference: string
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

export async function getLocationsFromOISF(route: string): Promise<any> {
  const url = `${ADMINISTRATIVE_STRUCTURE_URL}/${route}`
  // tslint:disable-next-line:no-console
  console.log(`Fetching: ${url}. Please wait ....`)
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  return await res.json()
}
