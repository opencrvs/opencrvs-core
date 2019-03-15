import fetch from 'node-fetch'
import { generateLocationResource } from '../scripts/service'
import { FHIR_URL } from 'src/constants'

export interface ILocation {
  id: string
  name: string
  nameBn: string
  physicalType: string
  type: string
  partOf: string
}

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

  const locations = {
    data: locationBundleCRVSOffices.entry
      .map((entry: fhir.BundleEntry) =>
        generateLocationResource(entry.resource as fhir.Location)
      )
      .concat(
        locationBundleHealthFacilities.entry.map((entry: fhir.BundleEntry) =>
          generateLocationResource(entry.resource as fhir.Location)
        )
      )
  }

  return locations
}
