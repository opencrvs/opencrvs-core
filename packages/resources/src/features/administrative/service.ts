import fetch from 'node-fetch'
import { ADMINISTRATIVE_STRUCTURE_URL } from 'src/constants'
// import { logger } from 'src/logger'
import { v4 as uuid } from 'uuid'
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

export async function getLocationData(
  route: string,
  adminLevel: number
): Promise<ILocation[]> {
  const url = `${ADMINISTRATIVE_STRUCTURE_URL}/${route}`
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

export async function getDistrictData(
  divisions: ILocation[]
): Promise<ILocation[]> {
  let districts: ILocation[] = []
  for (const division of divisions) {
    const districtsInDivision = await getLocationData(
      `district?division=${division.identifier[0].value}`,
      division.identifier[0].value
    )
    districts = districtsInDivision.reduce((total, item) => {
      total.push(item)
      return total
    }, districts)
  }
  return districts
}
