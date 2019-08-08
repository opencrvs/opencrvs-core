import { FHIR_URL } from '@resources/constants'
import fetch from 'node-fetch'
import { generateSimpleLocationResource } from '@resources/bgd/features/facilities/scripts/service'
import { ILocation } from '@resources/bgd/features/utils'

export interface ILocationDataResponse {
  data: ILocation[]
}

export async function getLocations(): Promise<ILocationDataResponse> {
  const res = await fetch(`${FHIR_URL}/Location?type=ADMIN_STRUCTURE&_count=0`)
  const locationBundle = await res.json()
  const locations = {
    data: locationBundle.entry.reduce(
      (accumulator: { [key: string]: ILocation }, entry: fhir.BundleEntry) => {
        if (!entry.resource || !entry.resource.id) {
          throw new Error('Resource in entry not valid')
        }

        accumulator[entry.resource.id] = generateSimpleLocationResource(
          entry.resource as fhir.Location
        )

        return accumulator
      },
      {}
    )
  }

  return locations
}
