import { FHIR_URL } from 'src/constants'
import fetch from 'node-fetch'
import { generateLocationResource } from 'src/features/facilities/scripts/service'

export interface ILocation {
  id: string
  name: string
  nameBn: string
  physicalType: string
  jurisdictionType: string
  type: string
  partOf: string
}

export interface ILocationDataResponse {
  data: ILocation[]
}

export async function getLocations(): Promise<ILocationDataResponse> {
  const res = await fetch(`${FHIR_URL}/Location?type=ADMIN_STRUCTURE&_count=0`)
  const locationBundle = await res.json()
  const locations = {
    data: locationBundle.entry.map((entry: fhir.BundleEntry) =>
      generateLocationResource(entry.resource as fhir.Location)
    )
  }

  return locations
}
