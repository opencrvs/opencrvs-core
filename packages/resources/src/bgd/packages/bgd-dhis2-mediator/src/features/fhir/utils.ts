import fetch from 'node-fetch'
import { FHIR_URL } from '@search/constants'

export async function fetchLocationByIdentifier(locationIdentifer: string) {
  // TODO recursively query bbs codes?
  return { id: 'xyz' }
}

export async function postBundle(bundle: fhir.Bundle) {
  const res = await fetch(FHIR_URL, {
    method: 'POST',
    headers: {},
    body: JSON.stringify(bundle)
  })

  if (!res.ok) {
    throw new Error(
      `Error status code received in response, ${res.statusText} ${res.status}`
    )
  }

  return res.json()
}
