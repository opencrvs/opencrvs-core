import { FHIR_URL } from 'src/constants'
import fetch from 'node-fetch'
import { generateLocationResource } from 'src/features/facilities/scripts/service'
import { ILocation } from 'src/features/utils/bn'

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

        accumulator[entry.resource.id] = generateLocationResource(
          entry.resource as fhir.Location
        )

        return accumulator
      },
      {}
    )
  }

  return locations
}
