import fetch from 'node-fetch'
import { IAuthHeader } from '@metrics/features/registration'
import { fhirUrl } from '@metrics/constants'

export function fetchFHIR<T = any>(
  suffix: string,
  authHeader: IAuthHeader,
  method: string = 'GET',
  body?: string
) {
  return fetch(`${fhirUrl}${suffix}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      ...authHeader
    },
    body
  })
    .then(response => {
      return response.json() as Promise<T>
    })
    .catch(error => {
      return Promise.reject(new Error(`FHIR request failed: ${error.message}`))
    })
}

export function fetchTaskHistory(taskId: string, authHeader: IAuthHeader) {
  return fetchFHIR<fhir.Bundle>(`Task/${taskId}/_history`, authHeader)
}

export const fetchLocation = async (
  locationId: string,
  authHeader: IAuthHeader
) => {
  return await fetchFHIR(`Location/${locationId}`, authHeader)
}

export async function fetchParentLocationByLocationID(
  locationID: string,
  authHeader: IAuthHeader
) {
  const location = await fetchFHIR(locationID, authHeader)
  return location && location.partOf && location.partOf.reference
}
