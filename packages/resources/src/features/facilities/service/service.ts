import fetch from 'node-fetch'
import { generateLocationResource } from '@resources/features/administrative/scripts/service'
import { FHIR_URL } from '@resources/constants'
import { ILocation } from '@resources/features/utils/bn'

export interface ILocationDataResponse {
  data: ILocation[]
}

export async function getFacilities(): Promise<ILocationDataResponse> {
  const resCRVSOffices = await fetch(
    `${FHIR_URL}/Location?type=CRVS_OFFICE&_count=0`
  )
  const resHealthFacilities = await fetch(
    `${FHIR_URL}/Location?type=HEALTH_FACILITY&_count=0`
  )

  const locationBundleCRVSOffices = await resCRVSOffices.json()
  const locationBundleHealthFacilities = await resHealthFacilities.json()

  const facilities = locationBundleCRVSOffices.entry.reduce(
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

  locationBundleHealthFacilities.entry.reduce(
    (accumulator: { [key: string]: ILocation }, entry: fhir.BundleEntry) => {
      if (!entry.resource || !entry.resource.id) {
        throw new Error('Resource in entry not valid')
      }

      accumulator[entry.resource.id] = generateLocationResource(
        entry.resource as fhir.Location
      )
      return accumulator
    },
    facilities
  )

  const locations = {
    data: facilities
  }

  return locations
}
