import fetch from 'node-fetch'
import { ADMINISTRATIVE_STRUCTURE_URL } from '../../constants'
import { logger } from '../../logger'
import { v4 as uuid } from 'uuid'
import { replaceParamsInRoute } from '../../util/routeUtils'
import { appendDivisions } from '../../util/divisionsUtils'
interface IIdentifier {
  system: string
  value: number
}

export interface ILocation {
  id: string
  resourceType: string
  identifier: IIdentifier[]
  name: string
  alias: string[]
  status: string
  mode: string
  partOf: {
    reference: string
  }
  extension: IExtension[]
}

interface IExtension {
  url: string
  valueAttachment: {
    contentType: string
    data: string
  }
}

interface IOISFLocation {
  bbsCode: unknown
  name: string
  nameBn: string
  id: number
}

const composeFhir = (
  location: IOISFLocation,
  adminLevel: number
): ILocation => {
  return {
    id: uuid(),
    resourceType: 'Location',
    identifier: [
      {
        system: 'http://opencrvs.org/specs/id/a2i-internal-id',
        value: location.id
      },
      {
        system: 'http://opencrvs.org/specs/id/bbs-code',
        value: location.bbsCode as number
      }
    ],
    name: location.name, // English name
    alias: [location.nameBn], // Bangla name in element 0
    status: 'active',
    mode: 'instance',
    partOf: {
      reference: `Location/${adminLevel}` // Reference to the admin location that is one level up from this one
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

export async function requestLocations(
  route: string,
  adminLevel: number
): Promise<ILocation[]> {
  const url = `${ADMINISTRATIVE_STRUCTURE_URL}/${route}`
  logger.info(`url: ${url}`)
  const res = await fetch(url, {
    method: 'GET'
  })

  if (res.status !== 200) {
    throw Error(res.statusText)
  }

  const locations: ILocation[] = []
  const body = await res.json()

  body.forEach((location: IOISFLocation) => {
    locations.push(composeFhir(location, adminLevel))
  })
  return locations
}

export async function getDivisionsByLevel(
  route: string,
  firstLevelDivisions: ILocation[],
  secondLevelDivisions?: ILocation[],
  thirdLevelDivisions?: ILocation[]
): Promise<ILocation[]> {
  let divisions: ILocation[] = []
  let queryRoute: string
  let queryResult: ILocation[] = []
  for (const firstLevelDivision of firstLevelDivisions) {
    const routeParams: string[] = []
    routeParams.push(String(firstLevelDivision.identifier[0].value))
    if (secondLevelDivisions) {
      // 2nd level
      for (const secondLevelDivision of secondLevelDivisions) {
        const secondLevelDivisionID = secondLevelDivision.identifier[0].value
        routeParams.push(String(secondLevelDivisionID))
        if (thirdLevelDivisions) {
          // 3rd level
          for (const thirdLevelDivision of thirdLevelDivisions) {
            const thirdLevelDivisionID = thirdLevelDivision.identifier[0].value
            routeParams.push(String(thirdLevelDivisionID))
            queryRoute = replaceParamsInRoute(route, routeParams)
            // logger.info(`queryRoute: ${queryRoute}`)
            queryResult = await requestLocations(
              queryRoute,
              thirdLevelDivisionID
            )
            divisions = appendDivisions(divisions, queryResult)
            routeParams.pop()
          }
        } else {
          queryRoute = replaceParamsInRoute(route, routeParams)
          // logger.info(`queryRoute: ${queryRoute}`)
          queryResult = await requestLocations(
            queryRoute,
            secondLevelDivisionID
          )
          divisions = appendDivisions(divisions, queryResult)
          routeParams.pop()
        }
      }
    } else {
      // 1st Level
      queryRoute = replaceParamsInRoute(route, routeParams)
      queryResult = await requestLocations(
        queryRoute,
        firstLevelDivision.identifier[0].value
      )
      divisions = appendDivisions(divisions, queryResult)
    }
  }
  return divisions
}
