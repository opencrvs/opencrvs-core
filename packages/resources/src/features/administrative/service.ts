import fetch from 'node-fetch'

import { fhirUrl } from 'src/constants'

export interface ISupportedBundleEntry extends fhir.BundleEntry {
  resource: fhir.Location
}

export interface ITemplatedBundle extends fhir.Bundle {
  resourceType: fhir.code
  // prettier-ignore
  entry: [ISupportedBundleEntry, ...fhir.BundleEntry[]]
}

export async function sendToFhir(doc: ITemplatedBundle) {
  const res = await fetch(fhirUrl, {
    method: 'POST',
    body: JSON.stringify(doc),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  const resBody = await res.json()
  if (
    !resBody ||
    !resBody.entry ||
    !resBody.entry[0] ||
    !resBody.entry[0].response ||
    !resBody.entry[0].response.location
  ) {
    throw new Error(`FHIR response did not send a valid response`)
  }
  return resBody
}
